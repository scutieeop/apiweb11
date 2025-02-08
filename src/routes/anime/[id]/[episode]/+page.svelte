<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    /** @type {import('./$types').PageData} */
    export let data;

    let videoPlayer;
    let isLoading = true;
    let error = null;
    let currentEpisode = parseInt($page.params.episode.replace('bolum-', ''));
    let episodes = [];
    let currentQuality = 'auto';
    let qualities = [];
    let showControls = true;
    let controlsTimeout;

    onMount(async () => {
        try {
            // Anime bilgilerini ve bölüm listesini al
            const response = await fetch(`/api/anime/${$page.params.id}`);
            const animeData = await response.json();
            
            if (!response.ok) throw new Error(animeData.message);
            
            episodes = animeData.episodes;
            
            // Video kaynaklarını al
            await loadVideoSources();
        } catch (err) {
            error = err.message;
        } finally {
            isLoading = false;
        }
    });

    async function loadVideoSources() {
        try {
            const response = await fetch(`/api/video/${$page.params.id}/${currentEpisode}`);
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message);
            
            qualities = Object.entries(data.sources).map(([quality, url]) => ({
                label: quality,
                url
            }));

            if (videoPlayer) {
                videoPlayer.src = qualities.find(q => q.label === currentQuality)?.url || qualities[0].url;
                videoPlayer.play();
            }
        } catch (err) {
            error = err.message;
        }
    }

    function changeQuality(quality) {
        const currentTime = videoPlayer.currentTime;
        currentQuality = quality;
        videoPlayer.src = qualities.find(q => q.label === quality).url;
        videoPlayer.currentTime = currentTime;
        videoPlayer.play();
    }

    function handleMouseMove() {
        showControls = true;
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            showControls = false;
        }, 3000);
    }

    function nextEpisode() {
        if (currentEpisode < episodes.length) {
            window.location.href = `/izle/${$page.params.id}/bolum-${currentEpisode + 1}`;
        }
    }

    function previousEpisode() {
        if (currentEpisode > 1) {
            window.location.href = `/izle/${$page.params.id}/bolum-${currentEpisode - 1}`;
        }
    }
</script>

<div class="video-page">
    {#if isLoading}
        <div class="loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Video yükleniyor...</p>
        </div>
    {:else if error}
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>{error}</p>
        </div>
    {:else}
        <div class="video-container" on:mousemove={handleMouseMove}>
            <video
                bind:this={videoPlayer}
                class="video-player"
                controls
                autoplay
                on:ended={nextEpisode}
            >
                <source src={qualities[0]?.url} type="video/mp4">
                Tarayıcınız video oynatmayı desteklemiyor.
            </video>

            {#if showControls}
                <div class="custom-controls">
                    <div class="episode-controls">
                        <button 
                            class="episode-btn" 
                            disabled={currentEpisode === 1}
                            on:click={previousEpisode}
                        >
                            <i class="fas fa-step-backward"></i>
                            Önceki Bölüm
                        </button>
                        <span class="episode-info">Bölüm {currentEpisode}</span>
                        <button 
                            class="episode-btn"
                            disabled={currentEpisode === episodes.length}
                            on:click={nextEpisode}
                        >
                            Sonraki Bölüm
                            <i class="fas fa-step-forward"></i>
                        </button>
                    </div>

                    <div class="quality-selector">
                        <span>Kalite:</span>
                        {#each qualities as quality}
                            <button
                                class="quality-btn"
                                class:active={currentQuality === quality.label}
                                on:click={() => changeQuality(quality.label)}
                            >
                                {quality.label}
                            </button>
                        {/each}
                    </div>
                </div>
            {/if}
        </div>

        <div class="episodes-list">
            <h3>Bölümler</h3>
            <div class="episodes-grid">
                {#each episodes as episode, index}
                    <a
                        href="/izle/{$page.params.id}/bolum-{index + 1}"
                        class="episode-card"
                        class:active={currentEpisode === index + 1}
                    >
                        <span class="episode-number">Bölüm {index + 1}</span>
                    </a>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style>
    .video-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .video-container {
        position: relative;
        width: 100%;
        background: #000;
        border-radius: 0.5rem;
        overflow: hidden;
        margin-bottom: 2rem;
    }

    .video-player {
        width: 100%;
        aspect-ratio: 16 / 9;
        display: block;
    }

    .custom-controls {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .episode-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .episode-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 0.25rem;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .episode-btn:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.2);
    }

    .episode-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .episode-info {
        color: white;
        font-weight: 500;
    }

    .quality-selector {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: white;
    }

    .quality-btn {
        padding: 0.25rem 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 0.25rem;
        color: white;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .quality-btn:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .quality-btn.active {
        background: var(--ms-primary);
    }

    .episodes-list {
        background: var(--ms-bg-secondary);
        border-radius: 0.5rem;
        padding: 1.5rem;
        border: 1px solid var(--ms-border);
    }

    .episodes-list h3 {
        margin: 0 0 1rem 0;
        color: var(--ms-text);
    }

    .episodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 1rem;
    }

    .episode-card {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        background: var(--ms-bg-primary);
        border: 1px solid var(--ms-border);
        border-radius: 0.5rem;
        color: var(--ms-text);
        text-decoration: none;
        transition: all 0.2s;
    }

    .episode-card:hover {
        transform: translateY(-2px);
        border-color: var(--ms-primary);
    }

    .episode-card.active {
        background: var(--ms-primary);
        color: white;
        border-color: var(--ms-primary);
    }

    .episode-number {
        font-size: 0.875rem;
        font-weight: 500;
    }

    .loading, .error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4rem;
        text-align: center;
        color: var(--ms-text);
    }

    .loading i, .error i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .error {
        color: #dc3545;
    }
</style> 