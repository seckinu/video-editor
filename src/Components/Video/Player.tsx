import { JSX, Show, createEffect, createSignal, onCleanup } from "solid-js";
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { videoState, setVideoState } from "@/Stores/VideoStore";
import * as commands from "@/bindings"

interface VideoPlayerProps extends JSX.MediaHTMLAttributes<HTMLVideoElement> { }

export default function VideoPlayer(props: VideoPlayerProps) {
	let videoRef: HTMLVideoElement | undefined;
	const [playbackSpeed, setPlaybackSpeed] = createSignal(1)

	const togglePlay = () => {
		if (!videoRef) return;
		if (videoRef.currentTime >= videoState.cropEnd) {
			videoRef.currentTime = videoState.cropStart;
		}
		if (videoRef.paused) {
			videoRef.play();
			setVideoState("isPlaying", true);
		} else {
			videoRef.pause();
			setVideoState("isPlaying", false);
		}
	};

	const handleTimeUpdate = () => {
		if (!videoRef) return;
		const currentTime = videoRef.currentTime;
		setVideoState("progress", currentTime);

		// Pause video if it exceeds crop end time
		if (currentTime >= videoState.cropEnd) {
			videoRef.pause();
			setVideoState("isPlaying", false);
		}
	};

	const handleProgressChange = (e: Event) => {
		if (!videoRef) return;
		const input = e.target as HTMLInputElement;
		const newTime = parseFloat(input.value);
		videoRef.currentTime = newTime;
	};

	const handleCropStartChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const newStart = parseFloat(input.value);
		setVideoState("cropStart", newStart);
		if (newStart >= videoState.cropEnd) {
			return
		}
		if (videoRef) videoRef.currentTime = newStart;
	};

	const handleCropEndChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const newEnd = parseFloat(input.value);
		setVideoState("cropEnd", newEnd);
	};

	const handlePlaybackSpeedChange = (e: Event) => {
		const input = e.target as HTMLInputElement;
		const value = parseFloat(input.value)

		setPlaybackSpeed(value)

		if (!videoRef) return;

		videoRef.playbackRate = value;
	}

	const selectFile = async () => {
		try {
			const { duration, file_path: filePath, fps } = await commands.selectVideo();

			setVideoState({
				filePath,
				duration,
				fps,
				cropEnd: duration,
				cropStart: 0,
				isPlaying: false,
				progress: 0
			})
		} catch (error) {
			console.error("Failed to select video:", error);
		}
	};

	const cropVideo = () => {
		commands.cropVideo(videoState.cropStart, videoState.cropEnd)
		console.log(videoState.cropStart, videoState.cropEnd)
	};

	onCleanup(() => {
		if (videoRef) {
			videoRef.pause();
		}
	});

	createEffect(() => {
		if (videoRef) {
			videoRef.currentTime = videoState.cropStart
		}
	})

	createEffect(() => {
		if (videoState.duration) {
			const cropEndSlider = document.getElementById('cropEnd') as HTMLInputElement;
			if (cropEndSlider)
				cropEndSlider.value = videoState.cropEnd.toString();

			const cropStartSlider = document.getElementById('cropStart') as HTMLInputElement;
			if (cropStartSlider)
				cropStartSlider.value = videoState.cropStart.toString();
		}
	});

	createEffect(() => {
		if (videoState.cropStart >= videoState.cropEnd - 1) {
			setVideoState("cropStart", videoState.cropEnd - 1)
		}
	})

	return (
		<div class={`relative flex flex-col ${props.class} w-full h-full max-w-full max-h-full`}>
			<button onClick={selectFile} class="mb-2 px-4 py-2 bg-green-500 text-white rounded">Select Video</button>

			<Show when={videoState.filePath !== ""}>
				<video
					ref={videoRef}
					onTimeUpdate={handleTimeUpdate}
					class="w-full h-auto max-h-full object-contain min-h-0"
					onclick={togglePlay}
					{...props}
				>
					<source src={convertFileSrc(videoState.filePath)} />
				</video>
			</Show>

			{/* controls */}
			{
				videoState.filePath &&
				<div class="flex flex-col gap-2 bg-opacity-50 bg-purple-400 w-full p-4">
					<div class="flex items-center">
						<button onClick={togglePlay} class="px-4 py-2 bg-blue-500 text-white rounded">
							{videoState.isPlaying ? "Pause" : "Play"}
						</button>
						<input
							type="range"
							min="0"
							max={videoState.duration}
							step="0.01"
							value={videoState.progress}
							onInput={handleProgressChange}
							class="flex-1 mx-4"
						/>
						<span class="text-white">{videoState.progress.toFixed(2)}s</span>
					</div>
					<div class="flex items-center">
						<label for="cropStart" class="mr-2 text-white">Start:</label>
						<input
							type="range"
							id="cropStart"
							min="0"
							max={videoState.duration}
							step="0.01"
							value={videoState.cropStart}
							onInput={handleCropStartChange}
							class="flex-1 mx-4"
						/>
						<span class="text-white">{videoState.cropStart.toFixed(2)}s</span>
					</div>
					<div class="flex items-center">
						<label for="cropEnd" class="mr-2 text-white">End:</label>
						<input
							type="range"
							id="cropEnd"
							min="0"
							max={videoState.duration}
							step="0.01"
							value={videoState.cropEnd}
							onInput={handleCropEndChange}
							class="flex-1 mx-4"
						/>
						<span class="text-white">{videoState.cropEnd.toFixed(2)}s</span>
					</div>
					<div class="flex items-center gap-2">
						<label for="playbackSpeed" class="text-white">Playback Speed:</label>
						<input
							type="range"
							id="playbackSpeed"
							min="0.5"
							max={1.5}
							step="0.1"
							value={playbackSpeed()}
							onInput={handlePlaybackSpeedChange}
							class="flex-1 mx-4"
						/>
						<span class="text-white">{playbackSpeed()}s</span>
						<span class="text-blue-400 cursor-pointer" onclick={() => {
							setPlaybackSpeed(1);
							if (!videoRef) return;
							videoRef.playbackRate = 1
						}}>reset</span>
					</div>
					<button onClick={cropVideo} class="px-4 py-2 bg-red-500 text-white rounded">Crop Video</button>
				</div>
			}
		</div>
	);
}
