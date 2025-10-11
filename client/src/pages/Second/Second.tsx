import styles from "./style.module.scss";
import SecondHeader from "./SecondHeader";
import OperationTab from "./OperationTab";
import StreamTab from "./StreamTab";
import secondStore from "../../store/secondStore";
import { useShallow } from "zustand/react/shallow";

const SecondPage = () => {
  const { currentTab } = secondStore(
    useShallow((s) => ({
      currentTab: s.currentTab,
    }))
  );
  return (
    <div className={styles.wrapper}>
      <SecondHeader />
      <div className={styles.wrapper__content}>
        {currentTab === "operationRoom" ? <OperationTab /> : <StreamTab />}
      </div>
    </div>
  );
};

export default SecondPage;
