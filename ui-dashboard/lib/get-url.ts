// this is used to make sure we get compatibility with vercel preview branches
// it's inspired from the supabase documenation https://supabase.com/docs/guides/auth/concepts/redirect-urls

// get URL gets either returns a) localhost b) production url c) vercel preview url
const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process?.env?.NEXT_PUBLIC_VERCEL_BRANCH_URL ?? // Automatically set by Vercel https://vercel.com/docs/projects/environment-variables/system-environment-variables
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel https://vercel.com/docs/projects/environment-variables/system-environment-variables
    "http://localhost:3002/";
  // Make sure to include `https://` when not localhost.
  url = url.includes("http") ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.charAt(url.length - 1) === "/" ? url : `${url}/`;
  return url;
};
export default getURL;
