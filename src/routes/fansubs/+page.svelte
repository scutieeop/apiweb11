<script>
    import { fade, fly } from 'svelte/transition';
    /** @type {import('./$types').PageData} */
    export let data;
    let loading = true;
    let error = null;
    let showSuccessModal = false;

    $: {
        try {
            console.log('Fansub sayfası - Data:', data);
            if (data.error) {
                error = data.error;
                loading = false;
            } else {
                error = null;
                loading = false;
                // Eğer data.success varsa modalı göster
                if (data.success) {
                    showSuccessModal = true;
                    setTimeout(() => {
                        showSuccessModal = false;
                    }, 2000);
                }
            }
        } catch (err) {
            console.error('Veri işleme hatası:', err);
            error = 'Veriler işlenirken bir hata oluştu';
            loading = false;
        }
    }

    $: fansubs = data.fansubs || [];

    console.log('Component yüklendi');
</script>

<div class="container">
    <h1>Fansublar</h1>
    <div class="debug-info">
        <p>Debug: Fansub sayısı: {fansubs.length}</p>
        <p>Debug: Data: {JSON.stringify(data)}</p>
    </div>

    {#if loading}
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Yükleniyor...</p>
        </div>
    {:else if error}
        <div class="error-state">
            <i class="fas fa-exclamation-circle"></i>
            <p>{error}</p>
        </div>
    {:else if !fansubs || fansubs.length === 0}
        <div class="empty-state">
            <i class="fas fa-users"></i>
            <p>Henüz hiç fansub bulunmuyor</p>
        </div>
    {:else}
        <div class="fansubs-grid">
            {#each fansubs as fansub}
                <div class="fansub-card">
                    <div class="fansub-header">
                        {#if fansub.logo}
                            <img src={fansub.logo} alt={fansub.name} class="fansub-logo" 
                                 on:error={(e) => e.target.src = '/default-fansub-logo.png'}/>
                        {:else}
                            <div class="fansub-logo-placeholder">
                                <i class="fas fa-users"></i>
                            </div>
                        {/if}
                        <div class="fansub-info">
                            <h2>{fansub.name}</h2>
                            <p class="fansub-description">{fansub.description || 'Açıklama bulunmuyor'}</p>
                            <p class="fansub-stats">
                                <span><i class="fas fa-users"></i> {fansub.members?.length || 0} üye</span>
                                <span class="status {fansub.status}">{fansub.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                            </p>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Başarılı Modal -->
{#if showSuccessModal}
    <div class="success-modal" transition:fly={{ y: 20, duration: 300 }}>
        <div class="modal-content" in:fade>
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>İşlem Başarılı!</h3>
        </div>
    </div>
{/if}

<style>
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        font-size: 2rem;
        font-weight: 600;
        color: var(--ms-text);
        margin-bottom: 2rem;
    }

    .fansubs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        padding: 2rem;
    }

    .fansub-card {
        background: var(--ms-bg-secondary);
        border: 1px solid var(--ms-border);
        border-radius: 1rem;
        padding: 1.5rem;
        transition: transform 0.2s ease;
    }

    .fansub-card:hover {
        transform: translateY(-4px);
    }

    .fansub-header {
        display: flex;
        gap: 1.5rem;
        align-items: flex-start;
    }

    .fansub-logo, .fansub-logo-placeholder {
        width: 80px;
        height: 80px;
        border-radius: 0.5rem;
        object-fit: cover;
        flex-shrink: 0;
    }

    .fansub-logo-placeholder {
        background: var(--ms-bg-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        color: var(--ms-text-secondary);
    }

    .fansub-info {
        flex: 1;
    }

    .fansub-info h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--ms-text);
        margin: 0 0 0.5rem 0;
    }

    .fansub-description {
        color: var(--ms-text-secondary);
        font-size: 0.875rem;
        line-height: 1.5;
        margin: 0;
    }

    .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--ms-text-secondary);
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .empty-state p {
        font-size: 1rem;
    }

    .debug-info {
        background: var(--ms-bg-secondary);
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        font-family: monospace;
        font-size: 0.875rem;
        color: var(--ms-text-secondary);
        white-space: pre-wrap;
        word-break: break-all;
    }

    .loading-state,
    .error-state {
        text-align: center;
        padding: 4rem 2rem;
        color: var(--ms-text-secondary);
    }

    .loading-state i,
    .error-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .error-state {
        color: #ff3e3e;
    }

    .fansub-stats {
        display: flex;
        gap: 1rem;
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: var(--ms-text-secondary);
    }

    .fansub-stats span {
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    .status {
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
    }

    .status.active {
        background: #4caf50;
        color: white;
    }

    .status.inactive {
        background: #ff9800;
        color: white;
    }

    @media (max-width: 768px) {
        .fansubs-grid {
            grid-template-columns: 1fr;
            padding: 1rem;
        }
    }

    .success-modal {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--ms-success, #4caf50);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .success-modal .modal-content {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .success-icon {
        font-size: 1.5rem;
        animation: bounce 0.5s ease infinite;
    }

    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-5px); }
    }

    .success-modal h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 500;
    }
</style> 