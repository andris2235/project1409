import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import notificationStore from "../../../store/notificationStore";

export const NotificationProvider: React.FC = () => {
    const { notification, setNotification } = notificationStore();
    const onClose = () => setNotification({ ...notification, visible: false });
    
    return (
        <Snackbar
            open={notification.visible}
            autoHideDuration={5000} // Время, через которое уведомление скроется автоматически
            onClose={onClose}
        >
            <div>
                <MuiAlert
                    elevation={6}
                    variant="filled"
                    onClose={onClose}
                    severity={notification.type}
                >
                    {notification.text}
                </MuiAlert>
            </div>
        </Snackbar>
    )
}

export default NotificationProvider;