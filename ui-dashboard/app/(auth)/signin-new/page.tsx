import { auth, signIn } from "@/auth";

export default async function SignIn() {
  const session = await auth();
  return session ? (
    <pre>{JSON.stringify(session, null, 2)}</pre>
  ) : (
    <form
      action={async (formData) => {
        "use server";
        await signIn("sendgrid", {
          email: formData.get("email"),
          callbackUrl: "/dashboard",
        });
      }}
    >
      <input type="text" name="email" placeholder="Email" />
      <button type="submit">Signin with Sendgrid</button>
    </form>
  );
}
