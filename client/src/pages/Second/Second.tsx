import { Tab, Tabs } from "@mui/material"
import styles from "./style.module.scss"
import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion";
import { baseURL } from "../../http";
import PresetVideoItem from "../../components/UI/PresetStream/PresetVideoItem";
import { sleep } from "../../utils/func";

const hlsStreams = [
  {url: `${baseURL}stream1/index.m3u8`, key: "console_big", poster: "/bigNoVideo.png"},
  {url: `${baseURL}stream2/index.m3u8`, key: "console_small", poster: "/smallNoVideo.png"},
  {url: `${baseURL}stream3/index.m3u8`, key: "Ptz_big", poster: "/noVideo.png"},
  {url: `${baseURL}stream4/index.m3u8`, key: "Ptz_small", poster: "/noVideo.png"},
];
const SecondPage = ()=>{
    const [currentTab, setCurrentTab] = useState<"operationRoom" | "stream">("operationRoom")
      const [currentStream, setCurrentStream] = useState(hlsStreams[0]);
  const [deletingStream, setDeletingPreset] = useState<null | string>(null);
  const [otherPresets, setOtherPresets] = useState(hlsStreams.slice(1))
    const setCurrentPresetHandler = async (key: string) => {
      const oldCurrent = { ...currentStream };
      const current = hlsStreams.find((i) => i.key === key);
      if (!current) return;
      // resetStreams()
      setDeletingPreset(current.key);
      setCurrentStream(current);
      await sleep(500);
      setOtherPresets((p) =>
        p.map((i) => (i.key === current.key ? oldCurrent : i))
      );
    };

    return (
        <div className={styles.wrapper}>
                      <Tabs
                className={styles.tabs}
                
                scrollButtons={false}
                variant="scrollable"
                value={currentTab}
            >
                           <Tab
                        disableRipple
                        className={`${styles.tab} ${currentTab === "operationRoom" ? styles.currentTab : ""}`}
                        
                        label={"Операционная"}
                        onClick={() => setCurrentTab("operationRoom")}
                        
                        value={"operationRoom"}
                    />
                           <Tab
                        disableRipple
                        className={`${styles.tab} ${currentTab === "stream" ? styles.currentTab : ""}`}
                        onClick={() => setCurrentTab("stream")}
                        label={"Трансляция"}
                        
                        value={"stream"}
                    />
            </Tabs>
               <div className={styles.cameraBlock}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            key={currentStream.key}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.5 }}
            className={styles.cameraBlock__current}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 703 448"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.currentBorderSvg}
            >
              <defs>
                <linearGradient
                  id="frameGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#A2B2F7" />
                  <stop offset="50%" stopColor="#CA97EA" />
                  <stop offset="100%" stopColor="#90BFFD" />
                </linearGradient>
              </defs>
              <rect
                x="4"
                y="4"
                width="695"
                height="440"
                rx="32"
                ry="32"
                fill="none"
                stroke="url(#frameGradient)"
                strokeWidth="8"
              />
            </svg>

            <div className={styles.cameraBlock__current__hls}>
              <PresetVideoItem streamUrl={currentStream.url} poster={currentStream.poster}/>
            </div>

            {/* <p>{currentStream.text}</p> */}
          </motion.div>
        </AnimatePresence>
        <div className={styles.miniCameras}>
          {otherPresets.map((i) => (
            <motion.div
              key={i.key}
              onClick={() => setCurrentPresetHandler(i.key)}
              initial={
                deletingStream === i.key
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: -40 }
              }
              animate={
                deletingStream === i.key
                  ? { opacity: 0, y: 40 }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.4 }}
              className={styles.miniCameras__camera}
            >
              <div>
                <PresetVideoItem streamUrl={i.url} poster={i.poster}/>
              </div>
              {/* <p>{i.text}</p> */}
            </motion.div>
          ))}
        </div>
      </div>
        </div>
    )
}

export default SecondPage