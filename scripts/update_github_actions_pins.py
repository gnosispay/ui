#!/usr/bin/env python3
"""
Scan .github/workflows for `uses:` references, resolve each action repo's newest
semver tag whose pointed commit is at least MIN_AGE_DAYS old, and rewrite pins as:

  uses: owner/repo@<full_sha> # <tag>

Requires network access to api.github.com. Set GITHUB_TOKEN in the environment
for higher rate limits (recommended).

Usage:
  python3 scripts/update_github_actions_pins.py [--dry-run] [--min-age-days N]

The script only edits workflow files; it does not run git.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path


USES_LINE = re.compile(r"^([ \t]*(?:-\s+)?uses:\s+)([^\s#]+)(\s*(?:#.*)?)$")
SEMVER_TAG = re.compile(
    r"^v?(?P<major>\d+)(?:\.(?P<minor>\d+)(?:\.(?P<patch>\d+))?)?(?:[+-].*)?$"
)


def http_json(url: str, token: str | None) -> object:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "gp-auth-module-ui-update-actions-script",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode())


def semver_tuple(tag: str) -> tuple[int, ...] | None:
    m = SEMVER_TAG.match(tag.strip())
    if not m:
        return None
    major = int(m.group("major"))
    minor = int(m.group("minor") or 0)
    patch = int(m.group("patch") or 0)
    return (major, minor, patch)


def parse_github_datetime(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def resolve_tag_sha(owner: str, repo: str, tag: str, token: str | None) -> str:
    enc = urllib.parse.quote(tag, safe="")
    data = http_json(
        f"https://api.github.com/repos/{owner}/{repo}/git/ref/tags/{enc}",
        token,
    )
    obj = data["object"]
    if obj["type"] == "commit":
        return obj["sha"]
    tag_obj = http_json(obj["url"], token)
    return tag_obj["object"]["sha"]


def commit_timestamp(owner: str, repo: str, sha: str, token: str | None) -> datetime:
    data = http_json(
        f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}",
        token,
    )
    return parse_github_datetime(data["commit"]["committer"]["date"])


def fetch_releases_tags(owner: str, repo: str, token: str | None) -> list[str]:
    names: list[str] = []
    page = 1
    while page <= 50:
        url = (
            f"https://api.github.com/repos/{owner}/{repo}/releases"
            f"?per_page=100&page={page}"
        )
        try:
            chunk = http_json(url, token)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                break
            raise
        if not isinstance(chunk, list) or not chunk:
            break
        for rel in chunk:
            if rel.get("draft"):
                continue
            if rel.get("prerelease"):
                continue
            tn = rel.get("tag_name")
            if tn and semver_tuple(tn):
                names.append(tn)
        if len(chunk) < 100:
            break
        page += 1
    return names


def fetch_repo_tags(owner: str, repo: str, token: str | None) -> dict[str, str]:
    """Map tag name -> commit SHA (API peeling)."""
    out: dict[str, str] = {}
    page = 1
    while page <= 50:
        url = (
            f"https://api.github.com/repos/{owner}/{repo}/tags"
            f"?per_page=100&page={page}"
        )
        chunk = http_json(url, token)
        if not isinstance(chunk, list) or not chunk:
            break
        for item in chunk:
            name = item.get("name")
            sha = (item.get("commit") or {}).get("sha")
            if name and sha and semver_tuple(name):
                out.setdefault(name, sha)
        if len(chunk) < 100:
            break
        page += 1
    return out


def pick_pin(
    owner: str,
    repo: str,
    min_age: timedelta,
    token: str | None,
    cache: dict[tuple[str, str], tuple[str, str] | None],
) -> tuple[str, str] | None:
    key = (owner, repo)
    if key in cache:
        return cache[key]

    now = datetime.now(timezone.utc)
    tag_map = fetch_repo_tags(owner, repo, token)
    release_tags = fetch_releases_tags(owner, repo, token)
    all_names = set(tag_map.keys())
    all_names.update(release_tags)

    ranked = sorted(all_names, key=lambda t: semver_tuple(t) or (), reverse=True)

    chosen: tuple[str, str] | None = None
    for tag in ranked:
        sha = tag_map.get(tag)
        if not sha:
            try:
                sha = resolve_tag_sha(owner, repo, tag, token)
            except urllib.error.HTTPError:
                continue
        try:
            ts = commit_timestamp(owner, repo, sha, token)
        except urllib.error.HTTPError:
            continue
        if now - ts >= min_age:
            chosen = (tag, sha)
            break

    cache[key] = chosen
    return chosen


def split_uses(spec: str) -> tuple[str, str] | None:
    spec = spec.strip()
    if spec.startswith("docker://") or spec.startswith("./"):
        return None
    if "@" not in spec:
        return None
    left, ref = spec.rsplit("@", 1)
    parts = left.split("/")
    if len(parts) != 2:
        return None
    owner, repo = parts
    if not owner or not repo:
        return None
    # Ignore non-SHA refs we might still parse (branch names); script replaces all github refs.
    if ref in ("",):
        return None
    return owner, repo


def process_workflow(
    path: Path,
    root: Path,
    min_age: timedelta,
    token: str | None,
    dry_run: bool,
    pin_cache: dict[tuple[str, str], tuple[str, str] | None],
) -> list[str]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    changed: list[str] = []

    for line in lines:
        m = USES_LINE.match(line.rstrip("\n"))
        if not m:
            out.append(line)
            continue
        prefix, spec, suffix = m.group(1), m.group(2), m.group(3)
        parsed = split_uses(spec)
        if not parsed:
            out.append(line)
            continue
        owner, repo = parsed
        pin = pick_pin(owner, repo, min_age, token, pin_cache)
        if not pin:
            print(f"WARN: no qualifying tag for {owner}/{repo} (skipped)", file=sys.stderr)
            out.append(line)
            continue
        tag, sha = pin
        new_line = f"{prefix}{owner}/{repo}@{sha} # {tag}\n"
        if line != new_line:
            rel = str(path.relative_to(root))
            changed.append(f"{rel}: {owner}/{repo} @{tag}")
            if not dry_run:
                line = new_line
        out.append(line)

    new_text = "".join(out)
    if new_text != text and not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return changed


def main() -> int:
    parser = argparse.ArgumentParser(description="Pin workflow actions to aged semver tags.")
    parser.add_argument("--dry-run", action="store_true", help="Print changes only")
    parser.add_argument(
        "--min-age-days",
        type=int,
        default=3,
        help="Only tags whose commit is at least this old (default: 3)",
    )
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        print(
            "WARNING: GITHUB_TOKEN/GH_TOKEN not set; anonymous API rate limits apply.",
            file=sys.stderr,
        )

    root = Path(__file__).resolve().parents[1]
    workflows = sorted((root / ".github" / "workflows").glob("*.yml")) + sorted(
        (root / ".github" / "workflows").glob("*.yaml")
    )
    if not workflows:
        print("No workflow files found.", file=sys.stderr)
        return 1

    min_age = timedelta(days=args.min_age_days)
    all_changes: list[str] = []
    pin_cache: dict[tuple[str, str], tuple[str, str] | None] = {}
    os.chdir(root)
    for wf in workflows:
        all_changes.extend(
            process_workflow(wf, root, min_age, token, args.dry_run, pin_cache)
        )

    if not all_changes:
        print("No updates needed (or all pins already match policy).")
        return 0

    for c in all_changes:
        print(c)

    seen = set()
    uniq_tags: list[str] = []
    for line in all_changes:
        detail = line.split(":", 1)[-1].strip()
        if detail not in seen:
            seen.add(detail)
            uniq_tags.append(detail)
    print("\nExact tags (deduplicated, for your commit message):")
    for d in uniq_tags:
        print(f"  - {d}")

    if args.dry_run:
        print("\nDry run: no files written.")
        return 0

    return 0


if __name__ == "__main__":
    raise SystemExit(main())