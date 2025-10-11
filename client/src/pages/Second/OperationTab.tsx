import SecondCameraBlock from "./SecondCameraBlock";
import SecondRecordBlock from "./SecondRecordBlock";
import SecondTvBlock from "./SecondTvBlock";
import styles from "./style.module.scss";

const OperationTab = () => {
  return (
    <>
      {" "}
      <div className={styles.managementBlock}>
        <SecondRecordBlock />
        <SecondTvBlock />
      </div>
      <SecondCameraBlock />
    </>
  );
};

export default OperationTab;
