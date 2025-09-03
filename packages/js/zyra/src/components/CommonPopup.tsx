import { ReactNode } from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";

type PopupProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const CommonPopup = ({ open, onClose, title = "Popup", children }: PopupProps) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Common Div */}
        <div>
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommonPopup;
