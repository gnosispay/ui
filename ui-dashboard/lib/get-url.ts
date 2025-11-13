// this is used to make sure we get compatibility with vercel preview branches
// it's inspired from the supabase documenation https://supabase.com/docs/guides/auth/concepts/redirect-urls

// get URL gets either returns a) localhost b) production url c) vercel preview url
const getURL = (): URL => {
  let urlString =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? // Automatically set by Vercel https://vercel.com/docs/projects/environment-variables/system-environment-variables
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel https://vercel.com/docs/projects/environment-variables/system-environment-variables
    "http://localhost:3002/";

  // Add protocol if missing (but not for localhost which already has it)
  if (!urlString.includes("http")) {
    urlString = `https://${urlString}`;
  }

  // Use URL constructor to properly format and validate the URL
  const url = new URL(urlString);

  // Ensure trailing slash on pathname
  if (!url.pathname.endsWith("/")) {
    url.pathname = url.pathname + "/";
  }

  return url;
};
export default getURL;
