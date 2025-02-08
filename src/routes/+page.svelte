<script>
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    export let data;
    const { recommendedAnimes } = data;

    function goToSearch() {
        goto('/kesfet');
    }

    // Blob URL'lerini oluştur ve sakla
    let blobUrls = new Map();

    onMount(() => {
        // Component unmount olduğunda blob URL'lerini temizle
        return () => {
            for (const url of blobUrls.values()) {
                URL.revokeObjectURL(url);
            }
        };
    });

    async function createBlobUrl(videoUrl) {
        if (blobUrls.has(videoUrl)) {
            return blobUrls.get(videoUrl);
        }

        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            blobUrls.set(videoUrl, blobUrl);
            return blobUrl;
        } catch (err) {
            console.error('Video URL oluşturma hatası:', err);
            return videoUrl;
        }
    }
</script>

<div class="home-page">
    <!-- Hero Section -->
    <div class="hero">
        <div class="hero-content">
            <h1>Animax</h1>
            <p>Türkiye'nin En İyi Anime İzleme Platformu</p>
            <div class="cta-buttons">
                <button class="cta-button primary" on:click={goToSearch}>
                    <i class="fas fa-search"></i>
                    Anime Ara
                </button>
                <button class="cta-button secondary" on:click={() => goto('/kesfet')}>
                    <i class="fas fa-compass"></i>
                    Keşfet
                </button>
            </div>
        </div>
    </div>

    <!-- Recommended Anime Section -->
    {#if recommendedAnimes.length > 0}
        <div class="recommended-section">
            <div class="section-header">
                <i class="fas fa-star header-icon"></i>
                <h2>Sizin İçin Seçtiklerimiz</h2>
                <p class="section-description">Editörlerimizin özenle seçtiği en iyi animeler</p>
            </div>
            <div class="anime-grid">
                {#each recommendedAnimes as anime}
                    <div class="anime-card" on:click={() => goto(anime.watchUrl)}>
                        <div class="anime-image" style="background-image: url({anime.logoUrl})">
                            <div class="anime-overlay">
                                <div class="overlay-content">
                                    <span class="watch-now">İzle</span>
                                    <span class="episode-count">{anime.totalEpisodes} Bölüm</span>
                                    {#if anime.totalSeasons > 1}
                                        <span class="season-info">
                                            {anime.totalSeasons} Sezon
                                        </span>
                                    {/if}
                                </div>
                            </div>
                        </div>
                        <div class="anime-info">
                            <h3>{anime.name}</h3>
                            {#if anime.totalSeasons > 1}
                                <div class="season-links">
                                    {#each Object.entries(anime.seasonUrls) as [season, url]}
                                        <button 
                                            class="season-button"
                                            on:click|stopPropagation={() => goto(url)}
                                        >
                                            Sezon {season}
                                        </button>
                                    {/each}
                                </div>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/if}

    <!-- Features Section -->
    <div class="features">
        <div class="feature">
            <i class="fas fa-tv feature-icon"></i>
            <h3>HD Kalite</h3>
            <p>Tüm animeleri yüksek kalitede izle</p>
        </div>
        <div class="feature">
            <i class="fas fa-closed-captioning feature-icon"></i>
            <h3>Türkçe Altyazı</h3>
            <p>Profesyonel çevirmenler tarafından hazırlanan altyazılar</p>
        </div>
        <div class="feature">
            <i class="fas fa-mobile-alt feature-icon"></i>
            <h3>Mobil Uyumlu</h3>
            <p>Her cihazda kesintisiz anime keyfi</p>
        </div>
    </div>
</div>

<style>
    .home-page {
        width: 100%;
        min-height: 100vh;
        background: var(--ms-bg-primary);
    }

    .hero {
        height: 80vh;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        background: linear-gradient(135deg, var(--ms-primary) 0%, #ff6b6b 100%);
        clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        padding: 2rem;
    }

    .hero-content {
        max-width: 800px;
        animation: fadeIn 1s ease-out;
    }

    h1 {
        font-size: 5rem;
        font-weight: 800;
        color: white;
        margin-bottom: 1rem;
        letter-spacing: -2px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .hero p {
        font-size: 1.5rem;
        color: rgba(255,255,255,0.9);
        margin-bottom: 2.5rem;
        line-height: 1.6;
    }

    .cta-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }

    .cta-button {
        padding: 1rem 2rem;
        font-size: 1.2rem;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;
        font-weight: 600;
    }

    .cta-button.primary {
        background: white;
        color: var(--ms-primary);
    }

    .cta-button.secondary {
        background: rgba(255,255,255,0.1);
        color: white;
        backdrop-filter: blur(10px);
    }

    .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .features {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
        padding: 4rem 2rem;
        background: var(--ms-bg-secondary);
        margin-top: -5vh;
    }

    .feature {
        text-align: center;
        padding: 2rem;
        background: var(--ms-bg-primary);
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }

    .feature:hover {
        transform: translateY(-5px);
    }

    .feature-icon {
        font-size: 2.5rem;
        color: var(--ms-primary);
        margin-bottom: 1rem;
    }

    .feature h3 {
        font-size: 1.5rem;
        color: var(--ms-text);
        margin-bottom: 0.5rem;
    }

    .feature p {
        color: var(--ms-text-secondary);
        line-height: 1.6;
    }

    .recommended-section {
        padding: 4rem 2rem;
        background: var(--ms-bg-secondary);
        margin-top: -5vh;
        position: relative;
        z-index: 1;
    }

    .section-header {
        text-align: center;
        margin-bottom: 3rem;
        color: var(--ms-text);
    }

    .header-icon {
        font-size: 2rem;
        color: var(--ms-primary);
        margin-bottom: 1rem;
    }

    .section-description {
        color: var(--ms-text-secondary);
        font-size: 1.1rem;
        margin-top: 0.5rem;
    }

    .overlay-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
    }

    .episode-count {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
        background: rgba(0, 0, 0, 0.5);
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
    }

    .season-info {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
        background: var(--ms-primary);
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        opacity: 0.9;
    }

    .season-links {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        margin-top: 0.5rem;
    }

    .season-button {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        border: none;
        border-radius: 8px;
        background: var(--ms-bg-secondary);
        color: var(--ms-text);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .season-button:hover {
        background: var(--ms-primary);
        color: white;
        transform: translateY(-2px);
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @media (max-width: 768px) {
        h1 {
            font-size: 3.5rem;
        }

        .hero p {
            font-size: 1.2rem;
        }

        .features {
            grid-template-columns: 1fr;
        }
    }
</style>
