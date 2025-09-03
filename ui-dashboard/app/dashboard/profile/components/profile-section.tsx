interface ProfileSectionProps {
  title?: string;
  heading?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const ProfileSection = ({
  title,
  heading,
  action,
  children,
}: ProfileSectionProps) => (
  <div className="border-gp-border border rounded-2xl shadow-gp-container grow basis-0 bg-white">
    <div className="p-5 pb-0">
      <div className="flex justify-between gap-2">
        {heading ? heading : <h2 className="text-lg font-medium">{title}</h2>}

        {action ? action : null}
      </div>
    </div>

    <hr className="my-4" />

    <div className="p-5 pt-0 flex flex-col">{children}</div>
  </div>
);

export default ProfileSection;
