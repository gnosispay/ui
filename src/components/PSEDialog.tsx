import { DialogContent, DialogTitle } from "./ui/dialog";

// we need to force the white background and black text
// because the iframe is not aware of the theme and the text is unreadable

export const PSEDialogContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <DialogContent aria-describedby={undefined} className="bg-white text-black">
      {children}
    </DialogContent>
  );
};

export const PSEDialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <DialogTitle className="text-black">{children}</DialogTitle>;
};
