import { createStore } from 'solid-js/store';
import * as commands from "@/bindings"

export interface VideoMetadata {
	filePath: string,
	duration: number,
	fps: number,
}

export const [videoMetadata, setVideoMetadata] = createStore<VideoMetadata>({
	filePath: "",
	duration: 0,
	fps: 0
})

export interface VideoState {
	isPlaying: boolean;
	progress: number;
	cropStart: number;
	cropEnd: number;
	playbackSpeed: number;
	videoRef?: HTMLVideoElement
}

export const [videoState, setVideoState] = createStore<VideoState>({
	isPlaying: false,
	progress: 0,
	cropStart: 0,
	cropEnd: 0,
	playbackSpeed: 1,
});

export const togglePlay = () => {
	const { videoRef } = videoState;
	if (!videoRef) return;

	if (videoRef.currentTime >= videoState.cropEnd) {
		setVideoState("progress", videoState.cropStart)
		videoRef.currentTime = videoState.cropStart;
	}

	if (videoRef.paused) {
		setVideoState("isPlaying", true);
		videoRef.play();
	} else {
		setVideoState("isPlaying", false);
		videoRef.pause();
	}
}

export const selectFile = async () => {
	try {
		const { duration, file_path: filePath, fps } = await commands.selectVideo();

		console.log(duration, filePath, fps)

		setVideoState({
			cropEnd: duration,
			cropStart: 0,
			isPlaying: false,
			progress: 0,
			playbackSpeed: 1,
		})
		setVideoMetadata({
			duration,
			filePath,
			fps
		})

	} catch (error) {
		console.error("Failed to select video:", error);
	}
};
