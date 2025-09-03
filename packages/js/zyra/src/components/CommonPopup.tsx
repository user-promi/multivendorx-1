import { ReactNode, forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";

// Slide transition from the right
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

type PopupProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  width?: number | string;
};

const CommonPopup = ({
  open,
  onClose,
  title = "Popup",
  children,
  header,
  footer,
  width = 500,
}: PopupProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      PaperProps={{
        sx: {
          margin: 0,
          height: "fit-content",
          maxWidth: 500,
          width: width,
          position: "fixed",
          right: '1rem',
          top: '3rem',
          borderRadius: '0.313rem',
        },
      }}
      hideBackdrop={false}
    >
      {header ? (
        <div className="title-wrapper">{header}</div>
      ) : (
        <DialogTitle>{title}</DialogTitle>
      )}

      <DialogContent>
        <div>{children}</div>
      </DialogContent>

      {footer && <DialogActions>{footer}</DialogActions>}
    </Dialog>
  );
};

export default CommonPopup;
