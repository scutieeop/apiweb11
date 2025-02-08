<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    
    let searchQuery = '';
    let isLoading = false;
    let searchResults = [];
    let selectedAnime = null;
    let error = null;
    let hasSearched = false;

    // Debug modu
    const DEBUG = true;
    function debug(...args) {
        if (DEBUG) {
            console.log('[Keşfet Debug]:', ...args);
        }
    }

    // Filtreler için state
    let filters = {
        type: 'all',
        status: 'all',
        year: 'all',
        sort: 'popularity'
    };

    const animeTypes = [
        { id: 'all', name: 'Tümü' },
        { id: 'tv', name: 'TV' },
        { id: 'movie', name: 'Film' },
        { id: 'ova', name: 'OVA' },
        { id: 'ona', name: 'ONA' }
    ];

    const animeStatus = [
        { id: 'all', name: 'Tümü' },
        { id: 'ongoing', name: 'Devam Ediyor' },
        { id: 'completed', name: 'Tamamlandı' }
    ];

    const sortOptions = [
        { id: 'popularity', name: 'Popülerlik' },
        { id: 'newest', name: 'En Yeni' },
        { id: 'oldest', name: 'En Eski' },
        { id: 'name', name: 'İsim' }
    ];

    async function handleSearch() {
        if (!searchQuery.trim()) {
            debug('Boş arama sorgusu');
            searchResults = [];
            hasSearched = false;
            return;
        }
        
        debug('Arama başlatılıyor', { searchQuery, filters });
        isLoading = true;
        error = null;
        try {
            const queryParams = new URLSearchParams({
                q: searchQuery,
                type: filters.type,
                status: filters.status,
                year: filters.year,
                sort: filters.sort
            });

            debug('API isteği yapılıyor', queryParams.toString());
            const response = await fetch(`/api/kesfet/search?${queryParams}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            debug('API yanıtı alındı', response.status);
            const data = await response.json();
            debug('API yanıt verisi', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Arama sırasında bir hata oluştu');
            }

            searchResults = data.results || [];
            hasSearched = true;
            debug('Arama sonuçları işlendi', searchResults.length);
        } catch (err) {
            console.error('Arama hatası:', err);
            error = err.message;
            searchResults = [];
            debug('Arama hatası oluştu', err);
        } finally {
            isLoading = false;
        }
    }

    function watchAnime(anime) {
        debug('Anime izlemeye yönlendiriliyor', anime);
        goto(`/anime/${anime.id}/bolum-1`);
    }

    function handleKeyPress(event) {
        if (event.key === 'Enter' && !isLoading) {
            debug('Enter tuşuna basıldı');
            handleSearch();
        }
    }

    // Filtreleri değiştirdiğimizde aramayı yap
    $: {
        if (filters && hasSearched) {
            debug('Filtreler değişti, arama yenileniyor', filters);
            handleSearch();
        }
    }
</script>

<div class="discover-page">
    <main class="main-content">
        <div class="search-section">
            <h1>Anime Keşfet</h1>
            <div class="search-box">
                <input
                    type="text"
                    bind:value={searchQuery}
                    on:keydown={handleKeyPress}
                    placeholder="Anime ara..."
                    disabled={isLoading}
                />
                <button on:click={handleSearch} disabled={isLoading}>
                    {#if isLoading}
                        <i class="fas fa-spinner fa-spin"></i>
                    {:else}
                        <i class="fas fa-search"></i>
                    {/if}
                </button>
            </div>
        </div>

        <div class="filters-section">
            <div class="filter-group">
                <label>Tür:</label>
                <select bind:value={filters.type}>
                    {#each animeTypes as type}
                        <option value={type.id}>{type.name}</option>
                    {/each}
                </select>
            </div>

            <div class="filter-group">
                <label>Durum:</label>
                <select bind:value={filters.status}>
                    {#each animeStatus as status}
                        <option value={status.id}>{status.name}</option>
                    {/each}
                </select>
            </div>

            <div class="filter-group">
                <label>Sıralama:</label>
                <select bind:value={filters.sort}>
                    {#each sortOptions as sort}
                        <option value={sort.id}>{sort.name}</option>
                    {/each}
                </select>
            </div>

            <div class="filter-group">
                <label>Yıl:</label>
                <select bind:value={filters.year}>
                    <option value="all">Tümü</option>
                    {#each Array.from({length: 24}, (_, i) => 2024 - i) as year}
                        <option value={year}>{year}</option>
                    {/each}
                </select>
            </div>
        </div>

        {#if error}
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>{error}</p>
            </div>
        {/if}

        {#if isLoading}
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Arama yapılıyor...</p>
            </div>
        {:else if searchResults.length > 0}
            <div class="results-grid">
                {#each searchResults as anime}
                    <div class="anime-card">
                        <div class="anime-poster">
                            <img src={anime.poster} alt={anime.name} on:error={(e) => e.target.src = '/default-poster.jpg'} />
                            <div class="anime-overlay">
                                <button class="watch-button" on:click={() => watchAnime(anime)}>
                                    <i class="fas fa-play"></i>
                                    İzle
                                </button>
                            </div>
                        </div>
                        <div class="anime-info">
                            <h3>{anime.name}</h3>
                            <div class="anime-meta">
                                <span class="year">{anime.year || 'N/A'}</span>
                                <span class="type">{anime.type || 'Anime'}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {:else if hasSearched}
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>Sonuç bulunamadı</p>
            </div>
        {:else}
            <div class="welcome-message">
                <i class="fas fa-search"></i>
                <h2>Anime Dünyasına Hoş Geldiniz!</h2>
                <p>İzlemek istediğiniz animeyi bulmak için yukarıdaki arama kutusunu kullanabilirsiniz.</p>
                <div class="search-tips">
                    <h3>Arama İpuçları:</h3>
                    <ul>
                        <li>Anime adını Türkçe veya orijinal ismiyle arayabilirsiniz</li>
                        <li>Filtreleri kullanarak aramanızı daraltabilirsiniz</li>
                        <li>En popüler animeleri görmek için "Popülerlik" sıralamasını kullanabilirsiniz</li>
                    </ul>
                </div>
            </div>
        {/if}
    </main>
</div>

<style>
    .discover-page {
        width: 100%;
        max-width: 1280px;
        margin: 0 auto;
        padding: 1rem;
    }

    .main-content {
        width: 100%;
    }

    .search-section {
        margin-bottom: 2rem;
        text-align: center;
    }

    h1 {
        font-size: 2rem;
        color: var(--ms-text);
        margin-bottom: 1rem;
    }

    .search-box {
        display: flex;
        gap: 0.5rem;
        max-width: 600px;
        margin: 0 auto;
    }

    .search-box input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 8px;
        background: var(--ms-bg-secondary);
        color: var(--ms-text);
        font-size: 1rem;
    }

    .search-box button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        background: var(--ms-primary);
        color: white;
        cursor: pointer;
        transition: all 0.2s;
    }

    .search-box button:hover {
        background: var(--ms-primary-dark);
    }

    .filters-section {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: var(--ms-bg-secondary);
        border-radius: 8px;
    }

    .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .filter-group label {
        color: var(--ms-text);
        font-weight: 500;
    }

    .filter-group select {
        padding: 0.5rem;
        border: none;
        border-radius: 4px;
        background: var(--ms-bg-tertiary);
        color: var(--ms-text);
        cursor: pointer;
    }

    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    .anime-card {
        background: var(--ms-bg-secondary);
        border-radius: 8px;
        overflow: hidden;
        transition: transform 0.2s;
    }

    .anime-card:hover {
        transform: translateY(-4px);
    }

    .anime-poster {
        position: relative;
        aspect-ratio: 2/3;
    }

    .anime-poster img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .anime-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.2s;
    }

    .anime-poster:hover .anime-overlay {
        opacity: 1;
    }

    .watch-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        background: var(--ms-primary);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
    }

    .watch-button:hover {
        background: var(--ms-primary-dark);
    }

    .anime-info {
        padding: 1rem;
    }

    .anime-info h3 {
        margin: 0;
        font-size: 1rem;
        color: var(--ms-text);
        margin-bottom: 0.5rem;
    }

    .anime-meta {
        display: flex;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--ms-text-secondary);
    }

    .loading, .error-message, .no-results, .welcome-message {
        text-align: center;
        padding: 2rem;
        color: var(--ms-text);
    }

    .loading i, .error-message i, .no-results i, .welcome-message i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .error-message {
        color: var(--ms-error);
    }

    .welcome-message {
        text-align: center;
        padding: 3rem 1rem;
        max-width: 800px;
        margin: 0 auto;
    }

    .welcome-message i {
        font-size: 3rem;
        color: var(--ms-primary);
        margin-bottom: 1.5rem;
    }

    .welcome-message h2 {
        font-size: 2rem;
        color: var(--ms-text);
        margin-bottom: 1rem;
    }

    .welcome-message p {
        font-size: 1.1rem;
        color: var(--ms-text-secondary);
        margin-bottom: 2rem;
    }

    .search-tips {
        text-align: left;
        background: var(--ms-bg-secondary);
        padding: 1.5rem;
        border-radius: 8px;
        margin-top: 2rem;
    }

    .search-tips h3 {
        font-size: 1.2rem;
        color: var(--ms-text);
        margin-bottom: 1rem;
    }

    .search-tips ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .search-tips li {
        color: var(--ms-text-secondary);
        margin-bottom: 0.5rem;
        padding-left: 1.5rem;
        position: relative;
    }

    .search-tips li:before {
        content: "•";
        color: var(--ms-primary);
        position: absolute;
        left: 0;
    }

    @media (max-width: 768px) {
        .filters-section {
            flex-direction: column;
        }

        .filter-group {
            width: 100%;
        }

        .filter-group select {
            width: 100%;
        }

        .results-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }

        .welcome-message {
            padding: 2rem 1rem;
        }

        .welcome-message h2 {
            font-size: 1.5rem;
        }

        .welcome-message p {
            font-size: 1rem;
        }

        .search-tips {
            padding: 1rem;
        }
    }
</style> 