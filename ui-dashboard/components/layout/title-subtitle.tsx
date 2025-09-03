export const TitleSubtitle = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) => (
  <div className="space-y-4">
    <h1 className="text-3xl text-center font-brand">{title}</h1>
    {subtitle && <p className="text-center text-primary">{subtitle}</p>}
  </div>
);
