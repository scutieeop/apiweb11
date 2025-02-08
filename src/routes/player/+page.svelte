<script>
    import { onMount } from 'svelte';

    let videoPlayer;
    let currentTime = 0;
    let duration = 0;
    let isPlaying = false;
    let volume = 1;
    let isMuted = false;
    let isFullscreen = false;
    let showControls = true;
    let hideControlsTimeout;

    // Video kontrollerini otomatik gizle/göster
    function handleMouseMove() {
        showControls = true;
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            if (isPlaying) showControls = false;
        }, 3000);
    }

    function togglePlay() {
        if (videoPlayer.paused) {
            videoPlayer.play();
            isPlaying = true;
        } else {
            videoPlayer.pause();
            isPlaying = false;
        }
    }

    function handleTimeUpdate() {
        currentTime = videoPlayer.currentTime;
        duration = videoPlayer.duration;
    }

    function handleSeek(e) {
        const rect = e.target.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoPlayer.currentTime = pos * duration;
    }

    function toggleMute() {
        videoPlayer.muted = !videoPlayer.muted;
        isMuted = videoPlayer.muted;
    }

    function handleVolumeChange(e) {
        volume = e.target.value;
        videoPlayer.volume = volume;
        isMuted = volume === 0;
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            videoPlayer.requestFullscreen();
            isFullscreen = true;
        } else {
            document.exitFullscreen();
            isFullscreen = false;
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    onMount(() => {
        // Video yüklendiğinde kontrolleri göster
        videoPlayer.addEventListener('loadedmetadata', () => {
            duration = videoPlayer.duration;
        });
    });
</script>

<div class="video-container" on:mousemove={handleMouseMove}>
    <video
        bind:this={videoPlayer}
        on:timeupdate={handleTimeUpdate}
        on:click={togglePlay}
        class="video-player"
    >
        <source src="/path/to/your/video.mp4" type="video/mp4">
        Tarayıcınız video oynatmayı desteklemiyor.
    </video>

    {#if showControls}
        <div class="controls">
            <div class="progress-bar" on:click={handleSeek}>
                <div class="progress" style="width: {(currentTime / duration) * 100}%"></div>
            </div>

            <div class="buttons">
                <button on:click={togglePlay}>
                    <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </button>

                <div class="volume-control">
                    <button on:click={toggleMute}>
                        <i class="fas {isMuted ? 'fa-volume-mute' : 'fa-volume-up'}"></i>
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        bind:value={volume}
                        on:input={handleVolumeChange}
                        class="volume-slider"
                    >
                </div>

                <div class="time">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                <button on:click={toggleFullscreen} class="fullscreen-btn">
                    <i class="fas {isFullscreen ? 'fa-compress' : 'fa-expand'}"></i>
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .video-container {
        position: relative;
        width: 100%;
        max-width: 1000px;
        margin: 0 auto;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
    }

    .video-player {
        width: 100%;
        height: auto;
        display: block;
    }

    .controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        padding: 1rem;
        transition: opacity 0.3s;
    }

    .progress-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        cursor: pointer;
        border-radius: 2px;
        margin-bottom: 1rem;
    }

    .progress {
        height: 100%;
        background: #ff3e00;
        border-radius: 2px;
        transition: width 0.1s linear;
    }

    .buttons {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    button:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .volume-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .volume-slider {
        width: 80px;
        height: 4px;
        -webkit-appearance: none;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }

    .volume-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
    }

    .time {
        color: white;
        font-size: 0.875rem;
        margin-left: auto;
    }

    .fullscreen-btn {
        margin-left: 1rem;
    }

    :global(.fas) {
        font-size: 1.25rem;
    }
</style> 