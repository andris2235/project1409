import { Tab, Tabs } from "@mui/material";
import styles from "./style.module.scss";
import secondStore from "../../store/secondStore";
import { useShallow } from "zustand/react/shallow";

const SecondHeader = () => {
  const { currentTab, setCurrentTab} = secondStore(
    useShallow((s) => ({
      currentTab: s.currentTab,
      setCurrentTab: s.setCurrentTab
    }))
  );
  return (
    <Tabs
      scrollButtons={false}
      variant="scrollable"
      value={currentTab}
      classes={{ root: styles.tabs }}
      TabIndicatorProps={{ style: { display: "none" } }}
    >
      <Tab
        disableRipple
        className={`${styles.tab} ${
          currentTab === "operationRoom" ? styles.currentTab : ""
        }`}
        label={
          <div className={styles.tabLabel}>
            <img src="/icons/operation.svg" alt="operation" fetchPriority="high"/>
            <p>Операционная</p>
          </div>
        }
        onClick={() => setCurrentTab("operationRoom")}
        value={"operationRoom"}
      />
      <Tab
        disableRipple
        className={`${styles.tab} ${
          currentTab === "stream" ? styles.currentTab : ""
        }`}
        onClick={() => setCurrentTab("stream")}
        label={
          <div className={styles.tabLabel}>
            <img src="/icons/stream.svg" alt="operation" fetchPriority="high"/>
            <p>Трансляция</p>
          </div>
        }
        value={"stream"}
      />
    </Tabs>
  );
};

export default SecondHeader;
