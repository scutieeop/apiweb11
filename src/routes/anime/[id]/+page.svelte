<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    let anime = null;
    let loading = true;
    let error = null;

    async function loadAnimeDetails() {
        try {
            const response = await fetch(`/api/anime/${$page.params.id}`);
            if (!response.ok) {
                throw new Error('Anime bilgileri alınamadı');
            }

            const data = await response.json();
            anime = {
                ...data,
                // Sezonları grupla
                seasons: data.bolumler.reduce((acc, bolum) => {
                    const season = bolum.season || 1;
                    if (!acc[season]) {
                        acc[season] = [];
                    }
                    acc[season].push(bolum);
                    return acc;
                }, {})
            };

            return true;
        } catch (err) {
            console.error('Anime detayları yükleme hatası:', err);
            error = err.message;
            return false;
        }
    }

    onMount(async () => {
        try {
            loading = true;
            await loadAnimeDetails();
        } finally {
            loading = false;
        }
    });

    function watchAnime(season, episode) {
        const videoUrl = anime.bolumler.find(b => b.season === season && b.episode === episode)?.videoUrls[0]?.original;
        if (videoUrl) {
            window.location.href = `/izle?v=${encodeURIComponent(videoUrl)}`;
        }
    }
</script>

{#if loading}
    <div class="loading">
        <div class="spinner"></div>
        <p>Anime yükleniyor...</p>
    </div>
{:else if error}
    <div class="error">
        <i class="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button on:click={loadAnimeDetails}>Tekrar Dene</button>
    </div>
{:else if anime}
    <div class="anime-details">
        <div class="anime-header">
            <div class="anime-cover" style="background-image: url({anime.logoUrl})">
                <div class="overlay">
                    <h1>{anime.name}</h1>
                </div>
            </div>
        </div>

        <div class="episodes-container">
            {#each Object.entries(anime.seasons) as [season, episodes]}
                <div class="season-block">
                    <h2>Sezon {season}</h2>
                    <div class="episodes-grid">
                        {#each episodes as episode}
                            <button 
                                class="episode-card"
                                on:click={() => watchAnime(episode.season, episode.episode)}
                            >
                                <div class="episode-number">Bölüm {episode.episode}</div>
                                <div class="episode-info">
                                    <i class="fas fa-play-circle"></i>
                                    <span>İzle</span>
                                </div>
                            </button>
                        {/each}
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style>
    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 300px;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--ms-bg-secondary);
        border-top: 4px solid var(--ms-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .error {
        text-align: center;
        padding: 2rem;
        color: var(--ms-error);
    }

    .error i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .error button {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: var(--ms-primary);
        color: white;
        cursor: pointer;
    }

    .anime-details {
        max-width: 1200px;
        margin: 0 auto;
    }

    .anime-header {
        position: relative;
        margin-bottom: 2rem;
    }

    .anime-cover {
        height: 300px;
        background-size: cover;
        background-position: center;
        border-radius: 12px;
        position: relative;
    }

    .overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 2rem;
        background: linear-gradient(transparent, rgba(0,0,0,0.8));
        border-radius: 0 0 12px 12px;
    }

    h1 {
        color: white;
        margin: 0;
        font-size: 2rem;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    .season-block {
        margin-bottom: 2rem;
    }

    h2 {
        color: var(--ms-text);
        margin-bottom: 1rem;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid var(--ms-primary);
    }

    .episodes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    .episode-card {
        background: var(--ms-bg-secondary);
        border: none;
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        color: var(--ms-text);
    }

    .episode-card:hover {
        transform: translateY(-2px);
        background: var(--ms-primary);
        color: white;
    }

    .episode-number {
        font-weight: 600;
    }

    .episode-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        opacity: 0.8;
    }

    @media (max-width: 768px) {
        .anime-cover {
            height: 200px;
        }

        h1 {
            font-size: 1.5rem;
        }

        .episodes-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
    }
</style> 