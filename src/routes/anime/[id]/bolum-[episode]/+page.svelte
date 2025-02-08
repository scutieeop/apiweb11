<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';

    let videoData = null;
    let loading = true;
    let error = null;
    let animeData = null;
    let selectedSource = null;
    let showFansubSelector = true;
    let selectedFansub = null;
    let showEpisodeList = false;

    async function loadVideo() {
        try {
            console.log('Video yükleme başlatılıyor...', {
                animeId: $page.params.id,
                episode: $page.params.episode
            });

            const response = await fetch(`/api/anime/${$page.params.id}/bolum-${$page.params.episode}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API yanıtı:', errorText);
                throw new Error(`Video yüklenirken bir hata oluştu (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('API yanıtı:', data);

            if (!data || !data.videos || data.videos.length === 0) {
                throw new Error('Video kaynağı bulunamadı');
            }

            // Bölüm listesi için test verisi
            if (!data.episodesBySeason || Object.keys(data.episodesBySeason).length === 0) {
                console.log('Test bölüm verisi oluşturuluyor...');
                data.episodesBySeason = {
                    "1": Array.from({ length: 12 }, (_, i) => ({
                        episode: i + 1,
                        season: 1,
                        title: `Bölüm ${i + 1}`
                    }))
                };
            }

            videoData = data;
            console.log('Video verisi güncellendi:', videoData);
            return data;
        } catch (err) {
            console.error('Video yükleme hatası:', err);
            error = err.message;
            throw err;
        }
    }

    async function loadAnimeDetails() {
        try {
            console.log('Anime detayları yükleniyor:', $page.params.id);
            
            const response = await fetch(`/api/anime/${$page.params.id}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API yanıtı:', errorText);
                throw new Error(`Anime bilgileri alınamadı (${response.status}): ${errorText}`);
            }

            const data = await response.json();
            console.log('Anime detayları alındı:', data);
            animeData = data;
            return data;
        } catch (err) {
            console.error('Anime detayları yükleme hatası:', err);
            error = err.message;
            throw err;
        }
    }

    function selectFansub(fansub) {
        selectedFansub = fansub;
        const source = videoData.videos.find(v => v.fansub === fansub);
        if (source && source.sources.length > 0) {
            selectedSource = source.sources[0].url;
        }
        showFansubSelector = false;
    }

    function changeSource(source) {
        selectedSource = source;
    }

    function toggleEpisodeList() {
        console.log('Bölüm listesi durumu değiştiriliyor...');
        console.log('Önceki durum:', showEpisodeList);
        console.log('Video verisi:', videoData);
        showEpisodeList = !showEpisodeList;
        console.log('Yeni durum:', showEpisodeList);
    }

    onMount(async () => {
        try {
            loading = true;
            await Promise.all([loadAnimeDetails(), loadVideo()]);
        } catch (err) {
            console.error('Sayfa yükleme hatası:', err);
            error = err.message;
        } finally {
            loading = false;
        }
    });

    $: episodeTitle = animeData?.name 
        ? `${animeData.name} - ${$page.params.episode}. Bölüm` 
        : 'Anime Yükleniyor...';
</script>

<div class="page-container">
    <div class="content-wrapper">
        <div class="main-content">
            <div class="episode-info">
                <div class="back-button" on:click={() => history.back()}>
                    <i class="fas fa-arrow-left"></i>
                </div>
                <div class="title-container">
                    <h1>{episodeTitle}</h1>
                    {#if animeData}
                        <div class="meta">
                            <span class="type">{animeData.type || 'Anime'}</span>
                            {#if animeData.year}
                                <span class="year">{animeData.year}</span>
                            {/if}
                            {#if videoData?.totalEpisodes}
                                <span class="episodes">{videoData.totalEpisodes} Bölüm</span>
                            {/if}
                            {#if selectedFansub}
                                <span class="provider">{selectedFansub}</span>
                            {/if}
                        </div>
                    {/if}
                </div>
            </div>

            <div class="video-container">
                {#if loading}
                    <div class="loading">
                        <div class="spinner"></div>
                        <span>Video yükleniyor...</span>
                    </div>
                {:else if error}
                    <div class="error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>{error}</p>
                        <button class="retry" on:click={() => { loading = true; loadVideo(); }}>Tekrar Dene</button>
                    </div>
                {:else if showFansubSelector && videoData?.videos}
                    <div class="fansub-selector">
                        <h2>Çeviri Ekibi Seçin</h2>
                        <div class="fansub-grid">
                            {#each videoData.videos as source}
                                <button 
                                    class="fansub-button"
                                    on:click={() => selectFansub(source.fansub)}
                                >
                                    <i class="fas fa-closed-captioning"></i>
                                    <span>{source.fansub}</span>
                                    <small>{source.sources.length} kaynak</small>
                                </button>
                            {/each}
                        </div>
                    </div>
                {:else if selectedSource}
                    <div class="player-wrapper">
                        <div class="video-player-container">
                            <div class="iframe-container">
                                <iframe
                                    src={selectedSource}
                                    frameborder="0"
                                    allowfullscreen
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                    loading="lazy"
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    {#if videoData?.videos}
                        <div class="source-selector">
                            <div class="source-header">
                                <h3>Video Kaynakları</h3>
                                <button class="episode-list-toggle" on:click={toggleEpisodeList}>
                                    <i class="fas fa-list"></i>
                                    Bölüm Listesi
                                </button>
                            </div>
                            <div class="source-buttons">
                                {#each videoData.videos as source}
                                    {#if source.fansub === selectedFansub}
                                        {#each source.sources as videoSource}
                                            <button 
                                                class="source-button"
                                                class:active={selectedSource === videoSource.url}
                                                on:click={() => changeSource(videoSource.url)}
                                            >
                                                {videoSource.name} - {videoSource.quality}
                                            </button>
                                        {/each}
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {/if}
                {/if}
            </div>

            <!-- Desktop Episode List -->
            <div class="desktop-episode-list">
                {#if videoData?.episodesBySeason && Object.keys(videoData.episodesBySeason).length > 0}
                    <div class="seasons-container">
                        {#each Object.entries(videoData.episodesBySeason) as [season, episodes]}
                            <div class="season-container">
                                <h4 class="season-title">
                                    <i class="fas fa-tv"></i>
                                    Sezon {season}
                                    <span class="episode-count">({episodes.length} Bölüm)</span>
                                </h4>
                                <div class="episode-grid">
                                    {#each episodes as episode}
                                        <a 
                                            href="/anime/{$page.params.id}/bolum-{episode.episode}"
                                            class="episode-item"
                                            class:active={parseInt($page.params.episode) === episode.episode}
                                        >
                                            <div class="episode-info">
                                                <span class="episode-number">Bölüm {episode.episode}</span>
                                                {#if episode.title && episode.title !== `Bölüm ${episode.episode}`}
                                                    <span class="episode-title">{episode.title}</span>
                                                {/if}
                                            </div>
                                            <div class="episode-meta">
                                                {#if parseInt($page.params.episode) === episode.episode}
                                                    <span class="watching">
                                                        <i class="fas fa-play"></i>
                                                        Şu an izleniyor
                                                    </span>
                                                {:else}
                                                    <span class="watch-button">
                                                        <i class="fas fa-play"></i>
                                                        İzle
                                                    </span>
                                                {/if}
                                            </div>
                                        </a>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="no-episodes">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Bölüm listesi bulunamadı</p>
                    </div>
                {/if}
            </div>

            <!-- Mobile Episode List -->
            {#if showEpisodeList}
                <div class="mobile-episode-list" transition:slide>
                    <div class="mobile-episode-header">
                        <h3>Bölümler</h3>
                        <button class="close-button" on:click={toggleEpisodeList}>
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    {#if videoData?.episodesBySeason && Object.keys(videoData.episodesBySeason).length > 0}
                        <div class="seasons-container">
                            {#each Object.entries(videoData.episodesBySeason) as [season, episodes]}
                                <div class="season-container">
                                    <h4 class="season-title">
                                        <i class="fas fa-tv"></i>
                                        Sezon {season}
                                        <span class="episode-count">({episodes.length} Bölüm)</span>
                                    </h4>
                                    <div class="episode-grid">
                                        {#each episodes as episode}
                                            <a 
                                                href="/anime/{$page.params.id}/bolum-{episode.episode}"
                                                class="episode-item"
                                                class:active={parseInt($page.params.episode) === episode.episode}
                                            >
                                                <div class="episode-info">
                                                    <span class="episode-number">Bölüm {episode.episode}</span>
                                                    {#if episode.title && episode.title !== `Bölüm ${episode.episode}`}
                                                        <span class="episode-title">{episode.title}</span>
                                                    {/if}
                                                </div>
                                                <div class="episode-meta">
                                                    {#if parseInt($page.params.episode) === episode.episode}
                                                        <span class="watching">
                                                            <i class="fas fa-play"></i>
                                                            Şu an izleniyor
                                                        </span>
                                                    {:else}
                                                        <span class="watch-button">
                                                            <i class="fas fa-play"></i>
                                                            İzle
                                                        </span>
                                                    {/if}
                                                </div>
                                            </a>
                                        {/each}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="no-episodes">
                            <i class="fas fa-exclamation-circle"></i>
                            <p>Bölüm listesi bulunamadı</p>
                        </div>
                    {/if}
                </div>
            {/if}

            <div class="episode-navigation">
                {#if videoData?.previousEpisode}
                    <a 
                        href="/anime/{$page.params.id}/bolum-{videoData.previousEpisode}" 
                        class="nav-button prev"
                    >
                        <i class="fas fa-chevron-left"></i>
                        <span class="nav-text">Önceki</span>
                    </a>
                {/if}
                
                {#if videoData?.nextEpisode}
                    <a 
                        href="/anime/{$page.params.id}/bolum-{videoData.nextEpisode}" 
                        class="nav-button next"
                    >
                        <span class="nav-text">Sonraki</span>
                        <i class="fas fa-chevron-right"></i>
                    </a>
                {/if}
            </div>
        </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <div class="mobile-nav-container">
        <nav class="mobile-nav">
            <a href="/" class="mobile-nav-item">
                <i class="fas fa-home"></i>
                <span>Ana Sayfa</span>
            </a>
            <button class="mobile-nav-item" on:click={toggleEpisodeList}>
                <i class="fas fa-list"></i>
                <span>Bölümler</span>
            </button>
            {#if selectedSource}
                <button class="mobile-nav-item" on:click={() => showFansubSelector = !showFansubSelector}>
                    <i class="fas fa-closed-captioning"></i>
                    <span>Altyazı</span>
                </button>
            {/if}
            <a href="/kesfet" class="mobile-nav-item">
                <i class="fas fa-compass"></i>
                <span>Keşfet</span>
            </a>
        </nav>
    </div>
</div>

<style>
    .page-container {
        width: 100%;
        min-height: 100vh;
        padding-bottom: 60px; /* Mobile nav height */
        position: relative;
        background: var(--ms-bg);
    }

    .content-wrapper {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 0.5rem;
    }

    .main-content {
        width: 100%;
    }

    .episode-info {
        margin-bottom: 1rem;
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 0.5rem;
    }

    .back-button {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ms-bg-secondary);
        border-radius: 50%;
        cursor: pointer;
        flex-shrink: 0;
    }

    .back-button:hover {
        background: var(--ms-primary);
        color: white;
    }

    .title-container {
        flex: 1;
        min-width: 0;
    }

    h1 {
        font-size: 1.2rem;
        color: var(--ms-text);
        margin: 0 0 0.5rem 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        color: var(--ms-text-secondary);
        font-size: 0.8rem;
    }

    .video-container {
        width: 100%;
        background: transparent;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
    }

    .loading, .error {
        padding: 2rem;
        text-align: center;
        color: var(--ms-text);
        min-height: 400px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .error {
        color: var(--ms-error);
    }

    .fansub-selector {
        padding: 2rem;
        text-align: center;
        background: var(--ms-bg-secondary);
        border-radius: 8px;
        min-height: 400px;
    }

    .fansub-selector h2 {
        margin-bottom: 2rem;
        color: var(--ms-text);
    }

    .fansub-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    .fansub-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.5rem;
        background: var(--ms-bg-primary);
        border: none;
        border-radius: 8px;
        color: var(--ms-text);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .fansub-button:hover {
        background: var(--ms-primary);
        color: white;
        transform: translateY(-2px);
    }

    .fansub-button i {
        font-size: 1.5rem;
    }

    .fansub-button small {
        color: var(--ms-text-secondary);
    }

    .player-wrapper {
        width: 100%;
        background: transparent;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .video-player-container {
        width: 100%;
        background: #000;
        position: relative;
        border-radius: 8px;
        overflow: hidden;
    }

    .iframe-container {
        position: relative;
        width: 100%;
        height: 0;
        padding-bottom: 56.25%; /* 16:9 aspect ratio */
        background: #000;
    }

    .iframe-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 8px;
    }

    .source-selector {
        margin-top: 1rem;
        padding: 1rem;
        background: var(--ms-bg-secondary);
        border-radius: 8px;
    }

    .source-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .source-header h3 {
        margin: 0;
        font-size: 1.1rem;
        color: var(--ms-text);
    }

    .episode-list-toggle {
        padding: 0.5rem 1rem;
        background: var(--ms-bg-primary);
        border: none;
        border-radius: 4px;
        color: var(--ms-text);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
    }

    .episode-list-toggle:hover {
        background: var(--ms-primary);
        color: white;
    }

    .source-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .source-button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        background: var(--ms-bg-primary);
        color: var(--ms-text);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 0.9rem;
    }

    .source-button:hover {
        background: var(--ms-primary);
        color: white;
    }

    .source-button.active {
        background: var(--ms-primary);
        color: white;
    }

    .episode-list {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 60px; /* Mobile nav height */
        top: auto;
        height: 80vh;
        background: var(--ms-bg);
        z-index: 100;
        overflow-y: auto;
        border-radius: 20px 20px 0 0;
        box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
    }

    .episode-list h3 {
        margin: 0 0 1rem 0;
        color: var(--ms-text);
    }

    .episode-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.5rem;
        padding: 0.5rem;
    }

    .episode-item {
        background: var(--ms-bg-secondary);
        border-radius: 8px;
        padding: 0.75rem;
    }

    .episode-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .episode-number {
        font-weight: 600;
        font-size: 1rem;
    }

    .episode-title {
        font-size: 0.9rem;
        opacity: 0.8;
    }

    .episode-meta {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-top: 0.5rem;
    }

    .watching, .watch-button {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        font-size: 0.8rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.1);
    }

    .watching i, .watch-button i {
        font-size: 0.8rem;
    }

    .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--ms-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }

    .episode-navigation {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 1rem;
    }

    .nav-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--ms-bg-secondary);
        color: var(--ms-text);
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.2s;
    }

    .nav-button:hover {
        background: var(--ms-primary);
        color: white;
    }

    .seasons-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .season-container {
        background: var(--ms-bg-primary);
        border-radius: 8px;
        padding: 1rem;
    }

    .season-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1.2rem;
        color: var(--ms-text);
        margin: 0 0 1rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--ms-border);
    }

    .season-title i {
        color: var(--ms-primary);
    }

    .episode-count {
        font-size: 0.9rem;
        color: var(--ms-text-secondary);
        margin-left: 0.5rem;
    }

    .no-episodes {
        text-align: center;
        padding: 2rem;
        color: var(--ms-text-secondary);
    }

    .no-episodes i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .mobile-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: var(--ms-bg-secondary);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 0.5rem;
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    }

    .mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        color: var(--ms-text-secondary);
        text-decoration: none;
        font-size: 0.8rem;
        padding: 0.25rem;
        border: none;
        background: none;
        cursor: pointer;
        transition: all 0.2s ease;
        min-width: 60px;
    }

    .mobile-nav-item i {
        font-size: 1.2rem;
    }

    .mobile-nav-item:hover,
    .mobile-nav-item.active {
        color: var(--ms-primary);
    }

    @media (max-width: 768px) {
        .page-container {
            padding-bottom: 60px;
        }

        .content-wrapper {
            padding: 0;
        }

        .video-container {
            border-radius: 0;
        }

        .episode-info {
            padding: 1rem;
        }

        .meta {
            font-size: 0.75rem;
        }

        .nav-button {
            padding: 0.5rem;
        }

        .nav-text {
            display: none;
        }

        .source-selector {
            margin: 0.5rem;
        }

        .episode-list {
            padding: 1rem;
        }

        .episode-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }

        .episode-item {
            padding: 0.5rem;
        }

        .episode-number {
            font-size: 0.9rem;
        }

        .episode-title {
            font-size: 0.8rem;
        }

        .watching, .watch-button {
            font-size: 0.75rem;
            padding: 0.2rem 0.4rem;
        }
    }

    @media (max-width: 480px) {
        .episode-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        }
    }

    .desktop-episode-list {
        display: block;
        margin-top: 2rem;
    }

    .mobile-episode-list {
        display: none;
    }

    .mobile-nav-container {
        display: none;
    }

    .mobile-episode-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid var(--ms-border);
    }

    .close-button {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: var(--ms-bg-secondary);
        color: var(--ms-text);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }

    .close-button:hover {
        background: var(--ms-primary);
        color: white;
    }

    @media (max-width: 768px) {
        .desktop-episode-list {
            display: none;
        }

        .mobile-episode-list {
            display: block;
            position: fixed;
            left: 0;
            right: 0;
            bottom: 60px;
            top: auto;
            height: 80vh;
            background: var(--ms-bg);
            z-index: 100;
            overflow-y: auto;
            border-radius: 20px 20px 0 0;
            box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
        }

        .mobile-nav-container {
            display: block;
        }
    }
</style> 