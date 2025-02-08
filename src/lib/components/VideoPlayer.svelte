<script>
    import { onMount, onDestroy } from 'svelte';

    // Props
    export let src = '';
    export let poster = '';

    // State variables
    let videoElement;
    let videoWrapper;
    let progress = 0;
    let currentTime = 0;
    let duration = 0;
    let isPlaying = false;
    let volume = 1;
    let isMuted = false;
    let isFullscreen = false;
    let showControls = true;
    let controlsTimeout;
    let isBuffering = false;
    let showVolumeControl = false;
    let isDragging = false;
    let wasPlaying = false;

    // Video yükleme ve temizleme
    onMount(() => {
        if (videoElement) {
            videoElement.volume = volume;
            
            // Video yüklendiğinde
            videoElement.addEventListener('loadedmetadata', () => {
                duration = videoElement.duration;
                videoElement.currentTime = 3; // 3. saniyeden başla
            });

            // Buffer durumunu izle
            videoElement.addEventListener('waiting', () => isBuffering = true);
            videoElement.addEventListener('canplay', () => isBuffering = false);
        }

        // Fullscreen değişikliklerini izle
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    });

    onDestroy(() => {
        if (videoElement) {
            videoElement.pause();
        }
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        clearTimeout(controlsTimeout);
    });

    // Video kontrolleri
    async function togglePlay() {
        if (!videoElement) return;

        try {
            if (videoElement.paused) {
                await videoElement.play();
            } else {
                await videoElement.pause();
            }
            isPlaying = !videoElement.paused;
        } catch (error) {
            console.error('Video oynatma hatası:', error);
        }
    }

    function updateProgress() {
        if (!videoElement || isDragging) return;
        currentTime = videoElement.currentTime;
        progress = (currentTime / duration) * 100;
    }

    function startDragging() {
        isDragging = true;
        wasPlaying = !videoElement.paused;
        if (wasPlaying) videoElement.pause();
    }

    function stopDragging() {
        isDragging = false;
        if (wasPlaying) videoElement.play();
    }

    function seek(event) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - bounds.left;
        const percentage = x / bounds.width;
        videoElement.currentTime = percentage * duration;
    }

    function handleProgressKeydown(event) {
        switch(event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                videoElement.currentTime -= 5;
                break;
            case 'ArrowRight':
                event.preventDefault();
                videoElement.currentTime += 5;
                break;
        }
    }

    function toggleMute() {
        if (!videoElement) return;
        videoElement.muted = !videoElement.muted;
        isMuted = videoElement.muted;
    }

    function handleVolumeChange(event) {
        volume = Number(event.target.value);
        videoElement.volume = volume;
        isMuted = volume === 0;
    }

    function toggleFullscreen() {
        if (!videoWrapper) return;

        if (!document.fullscreenElement) {
            videoWrapper.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    function handleFullscreenChange() {
        isFullscreen = !!document.fullscreenElement;
    }

    function showControlsTemporarily() {
        showControls = true;
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            showControls = false;
        }, 2000);
    }

    function formatTime(timeInSeconds) {
        if (!timeInSeconds) return '0:00';
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Klavye kontrolleri
    function handleKeydown(event) {
        if (!videoElement) return;

        switch(event.key.toLowerCase()) {
            case ' ':
            case 'k':
                event.preventDefault();
                togglePlay();
                break;
            case 'f':
                event.preventDefault();
                toggleFullscreen();
                break;
            case 'm':
                event.preventDefault();
                toggleMute();
                break;
            case 'arrowleft':
                event.preventDefault();
                videoElement.currentTime -= 5;
                break;
            case 'arrowright':
                event.preventDefault();
                videoElement.currentTime += 5;
                break;
            case 'arrowup':
                event.preventDefault();
                volume = Math.min(1, volume + 0.1);
                videoElement.volume = volume;
                break;
            case 'arrowdown':
                event.preventDefault();
                volume = Math.max(0, volume - 0.1);
                videoElement.volume = volume;
                break;
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div 
    class="video-wrapper"
    bind:this={videoWrapper}
    on:mousemove={showControlsTemporarily}
    on:mouseleave={() => showControls = false}
>
    <!-- Watermark -->
    <div class="watermark">
        <span>Animax Player</span>
    </div>

    <!-- Video -->
    <video
        bind:this={videoElement}
        {src}
        {poster}
        on:timeupdate={updateProgress}
        on:play={() => isPlaying = true}
        on:pause={() => isPlaying = false}
        on:click={togglePlay}
        class:cursor-hidden={isPlaying && !showControls}
    >
        Video oynatıcı yüklenemedi.
    </video>

    {#if isBuffering}
        <div class="buffering">
            <div class="spinner"></div>
        </div>
    {/if}

    <!-- Büyük oynat/durdur butonu -->
    <button 
        class="play-button-big"
        on:click={togglePlay}
        class:visible={!isPlaying || showControls}
    >
        <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}" style="margin-left: {isPlaying ? 0 : '5px'}"></i>
    </button>

    <!-- Kontrol paneli -->
    <div class="controls" class:visible={showControls}>
        <!-- İlerleme çubuğu -->
        <div 
            class="progress-bar"
            on:mousedown={startDragging}
            on:mouseup={stopDragging}
            on:mouseleave={stopDragging}
            on:click={seek}
            on:keydown={handleProgressKeydown}
            role="slider"
            aria-label="Video ilerleme çubuğu"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
            tabindex="0"
        >
            <div class="progress-background"></div>
            <div class="progress-filled" style="width: {progress}%"></div>
            <div class="progress-handle" style="left: {progress}%"></div>
        </div>

        <div class="controls-bottom">
            <!-- Sol kontroller -->
            <div class="controls-left">
                <button class="control-button" on:click={togglePlay} aria-label={isPlaying ? 'Durdur' : 'Oynat'}>
                    <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </button>

                <div 
                    class="volume-control"
                    on:mouseenter={() => showVolumeControl = true}
                    on:mouseleave={() => showVolumeControl = false}
                >
                    <button class="control-button" on:click={toggleMute}>
                        <i class="fas {isMuted || volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}"></i>
                    </button>
                    <div class="volume-slider" class:visible={showVolumeControl}>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            on:input={handleVolumeChange}
                        />
                    </div>
                </div>

                <div class="time">
                    <span>{formatTime(currentTime)}</span>
                    <span class="time-separator">/</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            <!-- Sağ kontroller -->
            <div class="controls-right">
                <button class="control-button" on:click={toggleFullscreen}>
                    <i class="fas {isFullscreen ? 'fa-compress' : 'fa-expand'}"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .video-wrapper {
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
        border-radius: 8px;
        overflow: hidden;
    }

    .video-content {
        width: 100%;
        height: 100%;
    }

    .video-content :global(iframe) {
        width: 100%;
        height: 100%;
        border: none;
    }

    .buffering {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .play-button-big {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80px;
        height: 80px;
        border-radius: 50%;
        border: none;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        cursor: pointer;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .play-button-big.visible {
        opacity: 1;
    }

    .play-button-big i {
        font-size: 32px;
    }

    .controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 20px;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .controls.visible {
        opacity: 1;
    }

    .controls-bottom {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    .controls-right {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .control-button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        border-radius: 50%;
        transition: all 0.2s ease;
    }

    .control-button:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .control-button i {
        font-size: 18px;
    }

    .watermark {
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.5);
        padding: 8px 12px;
        border-radius: 4px;
        z-index: 10;
        pointer-events: none;
        transition: opacity 0.3s ease;
    }

    .watermark span {
        color: white;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: linear-gradient(45deg, #ff0000, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
        .watermark {
            display: none;
        }
    }

    .progress-bar {
        position: relative;
        height: 4px;
        margin-bottom: 10px;
        cursor: pointer;
        transition: height 0.1s ease;
    }

    .progress-bar:hover {
        height: 6px;
    }

    .progress-background {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
    }

    .progress-filled {
        position: absolute;
        height: 100%;
        background: #ff0000;
        border-radius: 2px;
        transition: width 0.1s linear;
    }

    .progress-handle {
        position: absolute;
        top: 50%;
        width: 12px;
        height: 12px;
        background: #ff0000;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        transition: opacity 0.2s;
    }

    .progress-bar:hover .progress-handle {
        opacity: 1;
    }

    .controls-left {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .volume-control {
        position: relative;
        display: flex;
        align-items: center;
    }

    .volume-slider {
        width: 0;
        overflow: hidden;
        transition: width 0.2s ease;
        display: flex;
        align-items: center;
        margin-left: 8px;
    }

    .volume-slider.visible {
        width: 80px;
    }

    input[type="range"] {
        -webkit-appearance: none;
        width: 80px;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        outline: none;
    }

    input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 12px;
        height: 12px;
        background: white;
        border-radius: 50%;
        cursor: pointer;
        transition: transform 0.2s ease;
    }

    input[type="range"]::-webkit-slider-thumb:hover {
        transform: scale(1.2);
    }

    .time {
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .time-separator {
        opacity: 0.5;
    }

    video {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }

    video.cursor-hidden {
        cursor: none;
    }
</style> 