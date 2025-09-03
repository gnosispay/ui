import { PostHog } from "posthog-node";
import { posthogHostUrl } from "./posthog";

export default function PostHogClient() {
  const posthogClient = new PostHog(
    process.env.NEXT_PUBLIC_POSTHOG_KEY as string,
    {
      host: posthogHostUrl,
    },
  );
  return posthogClient;
}
