"use client";

interface InfoBannersProps {
  children: React.ReactNode;
}

export const InfoBanners = ({ children }: InfoBannersProps) => {
  return (
    <div className="overflow-x-auto pb-2 no-scrollbar">
      <div className="flex gap-4">
        {children}
      </div>
    </div>
  );
}; 