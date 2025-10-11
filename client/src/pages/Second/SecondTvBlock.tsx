import { useCallback, useEffect } from "react";
import Switch from "../../components/UI/Switch/Switch";
import styles from "./style.module.scss";
import notificationStore from "../../store/notificationStore";
import { handlerAxiosError } from "../../utils/func";
import secondStore from "../../store/secondStore";
import { useShallow } from "zustand/react/shallow";

const SecondTvBlock = () => {
  const { setTvSwitchDisabled, setTvIsOn, tvSwitchDisabled, tvIsOn } =
    secondStore(
      useShallow((s) => ({
        setTvSwitchDisabled: s.setTvSwitchDisabled,
        setTvIsOn: s.setTvIsOn,
        tvIsOn: s.tvIsOn,
        tvSwitchDisabled: s.tvSwitchDisabled,
      }))
    );
  const { setNotification } = notificationStore();
  const setTvValueHandler = useCallback(
    async (v: boolean) => {
      try {
        setTvSwitchDisabled(true);
        // await setTvState(v ? "on" : "off");
        setTvIsOn(v);
      } catch (error) {
        setNotification({
          visible: true,
          type: "error",
          text: handlerAxiosError(error),
        });
      } finally {
        setTvSwitchDisabled(false);
      }
    },
    [setNotification, setTvIsOn, setTvSwitchDisabled]
  );

  useEffect(() => {
    setTvValueHandler(true);
    return () => {
      setTvValueHandler(false);
    };
  }, [setTvValueHandler]);
  
  return (
    <div
      style={{
        background: !tvIsOn
          ? "rgba(255, 255, 255, 0.2)"
          : "linear-gradient(90deg, #CA97EA 0%, #90BFFD 100%)",
      }}
      className={styles.tvBlock}
    >
      <div
        style={{
          background: tvIsOn
            ? "#fff"
            : "linear-gradient(90deg, #CA97EA 0%, #90BFFD 100%)",
        }}
        className={styles.tvBlockIcon}
      >
        <img
          src={
            !tvIsOn ? "/icons/desktopLight.svg" : "/icons/desktopGradient.svg"
          }
          alt="desktop"
        />
      </div>
      <div className={styles.tvBlockStatus}>
        <h4>Монитор 32” 4K</h4>
        <p>Подключен</p>
        <Switch
          disabled={tvSwitchDisabled}
          on={tvIsOn}
          setOn={setTvValueHandler}
        />
      </div>
    </div>
  );
};

export default SecondTvBlock;
