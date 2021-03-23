import { io } from "socket.io-client";
import YouTube, { YouTubeProps } from "react-youtube";
import { useRouter } from "next/router";
import { YouTubePlayer } from 'youtube-player/dist/types';
import styles from '../../styles/Home.module.css';
import PlayerStates from "youtube-player/dist/constants/PlayerStates";
import { Socket } from "socket.io-client/build/socket";

const ALLOWED_SKEW_IN_SECONDS = parseInt(process.env.ALLOWED_SKEW_IN_SECONDS);
const SYNC_INTERVAL_IN_MILLISECONDS = parseInt(process.env.SYNC_INTERVAL_IN_MILLISECONDS);

function extractVideoId(url: string) {
    try {
        return new URL(url).searchParams.get('v');
    } catch (e) {
        console.error(`Error while parsing video url, falling back to id ${url}`);
        return url;
    }
}

function extractVideoTimestamp(url: string) {
    try {
        return parseInt(new URL(url).searchParams.get('t'));
    } catch (e) {
        console.error(`Error while parsing video url, falling back to id ${url}`);
        return 0;
    }
}

let youtubePlayer: YouTubePlayer;
let socket: Socket;

export default function YouTubeComponent({ videoUrl }) {
    const router = useRouter();
    const roomId = router?.query?.roomId;

    let syncIdentifier;
    let pauseAtTimeoutIdentifier;

    function playVideo(url: string, timestamp: number) {
        let videoId = extractVideoId(url);
        if (videoId === (youtubePlayer as any).playerInfo?.videoData?.video_id) {
            if (timestamp < youtubePlayer.getCurrentTime() - ALLOWED_SKEW_IN_SECONDS || timestamp > youtubePlayer.getCurrentTime() + ALLOWED_SKEW_IN_SECONDS) {
                youtubePlayer.seekTo(timestamp, true);
            }
            youtubePlayer.playVideo();
        } else {
            youtubePlayer.loadVideoById({videoId, startSeconds: timestamp});
        }
        clearTimeout(pauseAtTimeoutIdentifier);
    }

    function pauseVideo(url: string, timestamp: number) {
        let videoId = extractVideoId(url);
        if (!(videoId === (youtubePlayer as any).playerInfo?.videoData?.video_id)) {
            youtubePlayer.cueVideoById({videoId, startSeconds: timestamp});
        }
        pauseAtTimeoutIdentifier = setTimeout(() => youtubePlayer.pauseVideo(),youtubePlayer.getCurrentTime() - timestamp);
    }

    if (videoUrl) {
        const timestamp = extractVideoTimestamp(videoUrl);
        playVideo(videoUrl, timestamp);
        if (socket) {
            socket.emit('play', { url: videoUrl, timestamp })
        }
    }

    const youtubeProps: YouTubeProps = {
        containerClassName: styles.fullscreen,
        className: styles.fullscreen,
        id: 'video',
        onReady(event: { target: YouTubePlayer }) {
            youtubePlayer = event.target;
            fetch('/api/socketio').then(() => {
                socket = io();

                function sync() {
                    if (!pauseAtTimeoutIdentifier) {
                        socket.emit('play', {
                            currentTime: event.target.getCurrentTime(),
                            url: event.target.getVideoUrl()
                        })
                    }
                }

                youtubePlayer.addEventListener('onStateChange', () => {
                    const playerState = event.target.getPlayerState();
                    if (playerState === PlayerStates.PLAYING && !syncIdentifier) {
                        socket.emit('play', {
                            timestamp: event.target.getCurrentTime(),
                            url: event.target.getVideoUrl()
                        });
                        if (!syncIdentifier) {
                            syncIdentifier = window.setInterval(sync, SYNC_INTERVAL_IN_MILLISECONDS);
                        }
                        if (pauseAtTimeoutIdentifier) {
                            window.clearTimeout(pauseAtTimeoutIdentifier);
                        }
                    } else {
                        if (playerState === PlayerStates.PAUSED) {
                            socket.emit('pause', {
                                timestamp: event.target.getCurrentTime(),
                                url: event.target.getVideoUrl()
                            });
                        }
                        if (syncIdentifier) {
                            window.clearInterval(syncIdentifier);
                            syncIdentifier = undefined;
                        }
                    }
                });

                socket.on('connect', () => {
                    socket.emit('subscribe', { roomId });
                });

                socket.on('play', ({ url, timestamp }) => {
                    playVideo(url, timestamp);
                });

                socket.on('pause', ({ url, timestamp }) => {
                    pauseVideo(url, timestamp);
                });
            });
        }
    };

    return <div className={styles.fullscreen}>
        <YouTube {...youtubeProps} />
    </div>;
}
