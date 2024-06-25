import { setVideoState, togglePlay, videoMetadata, videoState } from "@/Stores/VideoStore";
import { FaSolidPause, FaSolidPlay, FaSolidScissors, FaSolidClock, FaSolidVolumeHigh, FaSolidVolumeXmark } from "solid-icons/fa";
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
			<ul class="flex justify-between gap-4 *:items-center *:justify-center *:py-2 *:px-3">
				<li onClick={togglePlay} class="cursor-pointer rounded-full bg-neutral-400/50 hover:bg-neutral-500/50 flex">
					<Switch>
						<Match when={videoState.isPlaying}>
							<FaSolidPause />
						</Match>
						<Match when={!videoState.isPlaying}>
							<FaSolidPlay />
						</Match>
					</Switch>
				</li>

				<li class="flex flex-1 gap-4">
					<input
						type="range"
						min="0"
						max={videoMetadata.duration}
						step="0.01"
						value={videoState.progress}
						onInput={handleProgressChange}
						class="flex-1"
					/>
					<span class="text-white">{videoState.progress.toFixed(0)}s</span>
				</li>

				<li class="relative group flex">
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

				<li class="relative group flex">
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

				<li class="relative group flex cursor-pointer">
					<div
						class="overflow-hidden transition-[max-width gap padding] duration-200 group-hover:max-w-64 group-hover:gap-4 group-hover:delay-0 group-hover:pr-4 delay-500 max-w-0 gap-0 flex-1 pr-0 flex"
					>
						<span class="cursor-auto min-w-10 text-right">{(videoState.volume * 100).toFixed(0)}%</span>
						<input
							type="range"
							min="0"
							max="1"
							step=".01"
							value={videoState.volume}
							onInput={(e) => {
								setVideoState("volume", parseFloat(e.currentTarget.value))
								setVideoState("isMuted", false)
							}}
							class="cursor-pointer"
						/>
					</div>

					<div onclick={() => { setVideoState("isMuted", !videoState.isMuted) }}>
						<Switch>
							<Match when={videoState.isMuted || videoState.volume === 0}>
								<FaSolidVolumeXmark />
							</Match>
							<Match when={!videoState.isMuted}>
					<FaSolidVolumeHigh />
							</Match>
						</Switch>
					</div>
				</li>
			</ul>
		</div>
	)
}