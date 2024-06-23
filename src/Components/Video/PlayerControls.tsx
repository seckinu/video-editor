import { setVideoState, togglePlay, videoMetadata, videoState } from "@/Stores/VideoStore";
import { FaSolidPause, FaSolidPlay, FaSolidScissors, FaSolidClock } from "solid-icons/fa";
import { JSX, Match, Switch } from "solid-js";

interface PlayerControlsProps { }

export default function PlayerControls(_props: PlayerControlsProps): JSX.Element {
	const handleProgressChange = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const value = parseFloat(input.value)

		setVideoState("progress", value)

		const { videoRef } = videoState
		if (!videoRef) return
		videoRef.currentTime = value
	}

	const handleCropStartChange = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const value = parseFloat(input.value)

		setVideoState("cropStart", value)
	}

	const handleCropEndChange = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const value = parseFloat(input.value)

		setVideoState("cropEnd", value)
	}

	const handlePlaybackSpeedChange = (e: Event) => {
		const input = e.currentTarget as HTMLInputElement;
		const value = parseFloat(input.value)

		setVideoState("playbackSpeed", value)

		const { videoRef } = videoState
		if (!videoRef) return
		videoRef.playbackRate = value
	}

	const resetPlaybackSpeed = () => {
		setVideoState("playbackSpeed", 1)

		const { videoRef } = videoState
		if (!videoRef) return
		videoRef.playbackRate = 1
	}

	return (
		<div class={`flex flex-col gap-2 bg-opacity-50 bg-slate-700 w-full py-2 px-4 list-none text-white`}>
			<div class="flex justify-between gap-4 *:flex *:items-center *:justify-center *:py-2 *:px-3">
				<li onClick={togglePlay} class="cursor-pointer rounded-full bg-neutral-400/50 hover:bg-neutral-500/50">
					<Switch>
						<Match when={videoState.isPlaying}>
							<FaSolidPause />
						</Match>
						<Match when={!videoState.isPlaying}>
							<FaSolidPlay />
						</Match>
					</Switch>
				</li>

				<li class="flex flex-1 gap-2">
					<input
						type="range"
						min="0"
						max={videoMetadata.duration}
						step="0.01"
						value={videoState.progress}
						onInput={handleProgressChange}
						class="flex-1"
					/>
					<span class="text-white">{videoState.progress.toFixed(2)}s</span>
				</li>

				<li class="relative group">
					<FaSolidScissors />

					<ul class="absolute -left-48 -top-24 bg-black bg-opacity-70 hidden group-hover:flex flex-col gap-2 p-2">
						<li>
							<label for="cropStart" class="mr-2 text-white">Start:</label>
							<input
								type="range"
								id="cropStart"
								min="0"
								max={videoMetadata.duration}
								step="0.01"
								value={videoState.cropStart}
								onInput={handleCropStartChange}
								class="flex-1 mx-4"
							/>
							<span class="text-white">{videoState.cropStart.toFixed(2)}s</span>
						</li>

						<li>
							<label for="cropEnd" class="mr-2 text-white">End:</label>
							<input
								type="range"
								id="cropEnd"
								min="0"
								max={videoMetadata.duration}
								step="0.01"
								value={videoState.cropEnd}
								onInput={handleCropEndChange}
								class="flex-1 mx-4"
							/>
							<span class="text-white">{videoState.cropEnd.toFixed(2)}s</span>
						</li>
					</ul>
				</li>

				<li class="relative group">
					<FaSolidClock />

					<ul class="absolute -left-36 -top-20 bg-black bg-opacity-70 hidden group-hover:flex flex-col gap-2 p-2">
						<li>
							<input
								type="range"
								id="playbackSpeed"
								min="0.25"
								max="4"
								step="0.05"
								value={videoState.playbackSpeed}
								onInput={handlePlaybackSpeedChange}
								class="mx-4 group-hover:block hidden"
							/>
							<span class="text-white">{videoState.playbackSpeed}x</span>
						</li>

						<li>
							<span class="text-blue-400 cursor-pointer" onclick={resetPlaybackSpeed}>reset</span>
						</li>
					</ul>
				</li>
			</div>
		</div>
	)
}