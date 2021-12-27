import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Close } from "@material-ui/icons";

const ConfirmDialog = ({ title, open, onClose, message = null }) => {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <Box position="absolute" top={0} right={0}>
        <IconButton onClick={() => onClose(false)}>
          <Close />
        </IconButton>
      </Box>
      {message != null && (
        <DialogContent style={{ marginBottom: "15px" }}>
          <Typography>{message}</Typography>
        </DialogContent>
      )}
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={() => onClose(false)}
        >
          Отменить
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => onClose(true)}
        >
          Подтвердить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
