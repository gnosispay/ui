export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex w-full bg-[#FCF9F2] self-start">{children}</div>;
}
