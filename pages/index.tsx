import Head from 'next/head';
import styles from '../styles/Home.module.css';
import YouTubeComponent from "./_components/_YouTubeComponent";
import { useEffect, useState } from "react";

function renderInput(cb: (string)=>void) {
    function keyPressHandler(event) {
        if (event.charCode === 13) {
            event.target.blur();
            cb(event.target.value);
        }
    }
    return <input type='text' onKeyPress={keyPressHandler}/>;
}

export default function Home() {
  const [videoUrl, setVideoUrl] = useState();
  return (
    <div className={styles.fullscreen}>
      <Head>
        <title>Matrix Dimension Youtube Sync</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.fullscreen}>
          <div className={styles.fullscreen}>
              <div className={styles.overlay}>
                  {renderInput(setVideoUrl)}
              </div>
              <YouTubeComponent videoUrl={videoUrl} />
          </div>
      </main>
    </div>
  );
}
