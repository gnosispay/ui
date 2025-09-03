export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-[#FCF9F2] max-w-lg m-auto flex-1">{children}</div>
  );
}
