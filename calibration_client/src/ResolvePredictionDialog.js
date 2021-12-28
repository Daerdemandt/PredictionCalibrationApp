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

export const ResolvePredictionResult = {
  UNCHANGED: -1,
  NOTFULLFILLED: 0,
  FULLFILLED: 1,
  AMBIGUOUS: 2,
};
Object.freeze(ResolvePredictionResult);

export const ResolvePredictionDialog = ({ open, message, onClose }) => {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Изменить статус предсказания</DialogTitle>
      <Box position="absolute" top={0} right={0}>
        <IconButton onClick={() => onClose(null)}>
          <Close />
        </IconButton>
      </Box>
      <DialogContent style={{ marginBottom: "15px" }}>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          color="primary"
          variant="contained"
          onClick={() => onClose(ResolvePredictionResult.UNCHANGED)}
        >
          Ещё не разрешено
        </Button>
        <Button
          color="trenary"
          variant="contained"
          onClick={() => onClose(ResolvePredictionResult.NOTFULLFILLED)}
        >
          Предсказание не исполнилось
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={() => onClose(ResolvePredictionResult.AMBIGUOUS)}
        >
          Результат неясен
        </Button>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => onClose(ResolvePredictionResult.FULLFILLED)}
        >
          Предсказание исполнилось
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResolvePredictionDialog;
