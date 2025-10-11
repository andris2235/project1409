import NotificationProvider from "./components/UI/Notification/Notification";
import MainRouter from "./Routes";

function App() {
  return (
    <>
      <NotificationProvider />
      <MainRouter/>
    </>
  );
}

export default App;
