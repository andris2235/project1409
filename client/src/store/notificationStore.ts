import { type AlertColor } from "@mui/material";
import { create } from "zustand";

interface INotification {
    visible: boolean,
    text: string,
    type: AlertColor
}

interface INotificationStore {
    notification: INotification,
    setNotification: (params: INotification) => void,
}

const notificationStore = create<INotificationStore>((set) => ({
    notification: {
        text: "",
        type: "info",
        visible: false,
    },
    setNotification: (notification) => set({ notification }),
}));

export default notificationStore;