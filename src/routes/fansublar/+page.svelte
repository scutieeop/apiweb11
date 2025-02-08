<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';

    /** @type {import('./$types').PageData} */
    export let data;

    $: fansubs = data.fansubs;

    let searchQuery = '';
    let sortBy = 'memberCount';
    let showOnlyActive = false;

    $: filteredFansubs = fansubs
        .filter(fansub => {
            const matchesSearch = fansub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                fansub.description?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesActive = !showOnlyActive || fansub.isUserMember;
            return matchesSearch && matchesActive;
        })
        .sort((a, b) => {
            if (sortBy === 'memberCount') return b.memberCount - a.memberCount;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });
</script>

<div class="container">
    <div class="header">
        <h1>Fansublar</h1>
        <p class="subtitle">Anime ve manga çeviri grupları</p>
    </div>

    <div class="filters">
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="Fansub ara..."
            />
        </div>

        <div class="filter-options">
            <select bind:value={sortBy} class="sort-select">
                <option value="memberCount">Üye Sayısına Göre</option>
                <option value="name">İsme Göre</option>
                <option value="createdAt">Tarihe Göre</option>
            </select>

            <label class="checkbox-label">
                <input 
                    type="checkbox" 
                    bind:checked={showOnlyActive}
                />
                Sadece Üye Olduklarım
            </label>
        </div>
    </div>

    <div class="fansubs-grid">
        {#each filteredFansubs as fansub (fansub._id)}
            <div class="fansub-card">
                <div class="fansub-header">
                    {#if fansub.logo}
                        <img src={fansub.logo} alt={fansub.name} class="fansub-logo" />
                    {:else}
                        <div class="fansub-logo-placeholder">
                            <i class="fas fa-users"></i>
                        </div>
                    {/if}
                    <div class="fansub-info">
                        <h2>{fansub.name}</h2>
                        <div class="fansub-meta">
                            <span class="member-count">
                                <i class="fas fa-user"></i>
                                {fansub.memberCount} üye
                            </span>
                            <span class="owner">
                                <i class="fas fa-crown"></i>
                                {fansub.owner?.username || 'Bilinmeyen'}
                            </span>
                        </div>
                    </div>
                </div>

                <p class="fansub-description">{fansub.description || 'Açıklama bulunmuyor.'}</p>

                <div class="fansub-stats">
                    <div class="stat">
                        <i class="fas fa-film"></i>
                        <span>{fansub.animeCount || 0} Anime</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-book"></i>
                        <span>{fansub.mangaCount || 0} Manga</span>
                    </div>
                    <div class="stat">
                        <i class="fas fa-clock"></i>
                        <span>Son güncelleme: {new Date(fansub.updatedAt || fansub.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                </div>

                <div class="fansub-footer">
                    <span class="created-at">
                        <i class="fas fa-calendar"></i>
                        {new Date(fansub.createdAt).toLocaleDateString('tr-TR')}
                    </span>

                    {#if $page.data.user}
                        {#if fansub.isUserMember}
                            <form 
                                method="POST" 
                                action="?/leave"
                                use:enhance
                                class="join-form"
                            >
                                <input type="hidden" name="fansubId" value={fansub._id} />
                                <button type="submit" class="leave-btn">
                                    <i class="fas fa-sign-out-alt"></i>
                                    Ayrıl
                                </button>
                            </form>
                        {:else}
                            <form 
                                method="POST" 
                                action="?/join"
                                use:enhance
                                class="join-form"
                            >
                                <input type="hidden" name="fansubId" value={fansub._id} />
                                <button type="submit" class="join-btn">
                                    <i class="fas fa-sign-in-alt"></i>
                                    Katıl
                                </button>
                            </form>
                        {/if}
                    {/if}
                </div>
            </div>
        {/each}

        {#if filteredFansubs.length === 0}
            <div class="empty-state">
                {#if searchQuery}
                    <i class="fas fa-search"></i>
                    <p>Aradığınız kriterlere uygun fansub bulunamadı</p>
                {:else}
                    <i class="fas fa-users"></i>
                    <p>Henüz hiç fansub bulunmuyor</p>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        text-align: center;
        margin-bottom: 2rem;
    }

    h1 {
        font-size: 2rem;
        font-weight: 600;
        color: var(--ms-text);
        margin: 0;
    }

    .subtitle {
        color: var(--ms-text-secondary);
        margin-top: 0.5rem;
    }

    .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .search-box {
        position: relative;
        flex: 1;
        min-width: 200px;
    }

    .search-box input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid var(--ms-border);
        border-radius: 0.5rem;
        background: var(--ms-bg-primary);
        color: var(--ms-text);
    }

    .search-box i {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--ms-text-secondary);
    }

    .filter-options {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .sort-select {
        padding: 0.75rem 1rem;
        border: 1px solid var(--ms-border);
        border-radius: 0.5rem;
        background: var(--ms-bg-primary);
        color: var(--ms-text);
    }

    .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--ms-text);
    }

    .fansubs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .fansub-card {
        background: var(--ms-bg-secondary);
        border: 1px solid var(--ms-border);
        border-radius: 1rem;
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .fansub-header {
        display: flex;
        gap: 1rem;
    }

    .fansub-logo, .fansub-logo-placeholder {
        width: 64px;
        height: 64px;
        border-radius: 0.5rem;
        object-fit: cover;
    }

    .fansub-logo-placeholder {
        background: var(--ms-bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: var(--ms-text-secondary);
    }

    .fansub-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .fansub-info h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ms-text);
        margin: 0;
    }

    .fansub-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
        color: var(--ms-text-secondary);
    }

    .member-count, .owner {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .owner i {
        color: #eab308;
    }

    .fansub-description {
        color: var(--ms-text);
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0;
    }

    .fansub-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
        padding: 1rem;
        background: var(--ms-bg-primary);
        border-radius: 0.5rem;
    }

    .stat {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--ms-text-secondary);
    }

    .fansub-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 1rem;
        border-top: 1px solid var(--ms-border);
    }

    .created-at {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: var(--ms-text-secondary);
    }

    .join-btn, .leave-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .join-btn {
        background: var(--ms-primary);
        color: white;
    }

    .join-btn:hover {
        background: var(--ms-primary-hover);
    }

    .leave-btn {
        background: var(--ms-danger);
        color: white;
    }

    .leave-btn:hover {
        background: var(--ms-danger-hover);
    }

    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 4rem;
        color: var(--ms-text-secondary);
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .empty-state p {
        font-size: 1rem;
    }

    @media (max-width: 768px) {
        .filters {
            flex-direction: column;
        }

        .filter-options {
            flex-wrap: wrap;
        }

        .sort-select {
            width: 100%;
        }
    }
</style> 