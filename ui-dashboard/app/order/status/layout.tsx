export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="m-auto flex-1 max-w-4xl flex bg-[#FCF9F2]">{children}</div>
  );
}
