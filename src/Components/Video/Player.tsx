import { JSX, Show, createEffect, onCleanup } from "solid-js";
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { videoState, setVideoState, videoMetadata, togglePlay, selectFile } from "@/Stores/VideoStore";
import PlayerControls from "./PlayerControls";
import { cropVideo } from "@/bindings";

interface VideoPlayerProps extends JSX.MediaHTMLAttributes<HTMLVideoElement> { }

export default function VideoPlayer(_props: VideoPlayerProps) {
	const handleTimeUpdate = () => {
		const { videoRef } = videoState
		if (!videoRef) return
		const currentTime = videoRef.currentTime;
		setVideoState("progress", currentTime);

		// Pause video if it exceeds crop end time
		if (currentTime >= videoState.cropEnd) {
			setVideoState("isPlaying", false);

			if (!videoRef) return
			videoRef.pause();
		} else {
			window.requestAnimationFrame(handleTimeUpdate)
		}
	};

	createEffect(() => {
		const { videoRef } = videoState
		if (!videoRef) return;
		videoRef.currentTime = videoState.cropStart
	})

	createEffect(() => {
		const cropEndSlider = document.getElementById('cropEnd') as HTMLInputElement;
		if (cropEndSlider)
			cropEndSlider.value = videoState.cropEnd.toString();

		const cropStartSlider = document.getElementById('cropStart') as HTMLInputElement;
		if (cropStartSlider)
			cropStartSlider.value = videoState.cropStart.toString();
	});

	createEffect(() => {
		if (videoState.cropStart >= videoState.cropEnd - 1) {
			setVideoState("cropStart", videoState.cropEnd - 1)
		}
	})

	onCleanup(() => {
		if (videoState.videoRef) {
			videoState.videoRef.pause()
		}
	});

	return (
		<div class="relative flex flex-col w-full h-full max-w-full max-h-full">
			<nav class="flex justify-between items-center bg-slate-700 p-2">
				<ul>
					<button onClick={selectFile} class="px-2 py-1 bg-green-500 text-white rounded">Open...</button>
				</ul>
				<ul>
					<button
						onClick={() => {
							cropVideo(videoState.cropStart, videoState.cropEnd)
						}}
						class="px-2 py-1 bg-red-500 text-white rounded"
					>
						Crop
					</button>
				</ul>
			</nav>
			<Show when={videoMetadata.filePath !== ""}>
				<video
					ref={(el) => {
						setVideoState("videoRef", el)
					}}
					onTimeUpdate={handleTimeUpdate}
					class="w-full h-auto max-h-full object-contain min-h-0"
					onclick={togglePlay}
					src={convertFileSrc(videoMetadata.filePath)}
				/>
				<PlayerControls />
			</Show>
		</div>
	);
}
