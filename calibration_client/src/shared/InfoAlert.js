import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@material-ui/core";

const InfoAlert = ({ title, open, onClose, message = null }) => {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      {message != null && (
        <DialogContent style={{ marginBottom: "15px" }}>
          <Typography>{message}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button color="primary" variant="contained" onClick={onClose}>
          ОК
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InfoAlert;
