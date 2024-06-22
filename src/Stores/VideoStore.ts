import { createStore } from 'solid-js/store';

export interface VideoState {
	isPlaying: boolean;
	progress: number;
	cropStart: number;
	cropEnd: number;
	filePath: string;
	duration: number;
}

export const [videoState, setVideoState] = createStore<VideoState>({
	isPlaying: false,
	progress: 0,
	cropStart: 0,
	cropEnd: 0,
	filePath: "",
	duration: 0
});
