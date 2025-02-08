<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { fade, fly } from 'svelte/transition';

    /** @type {import('./$types').PageData} */
    export let data;

    const roleIcons = {
        founder: { icon: 'fas fa-crown', color: 'text-yellow-500', name: 'Kurucu' },
        admin: { icon: 'fas fa-star', color: 'text-blue-500', name: 'Admin' },
        developer: { icon: 'fas fa-code', color: 'text-green-500', name: 'Geliştirici' },
        guide: { icon: 'fas fa-compass', color: 'text-purple-500', name: 'Rehber' },
        contributor: { icon: 'fas fa-pen', color: 'text-orange-500', name: 'Paylaşımcı' },
        user: { icon: 'fas fa-user', color: 'text-gray-500', name: 'Üye' }
    };

    let selectedUser = null;
    let banReason = '';
    let showAllUsers = false;

    // Fansub form değişkenleri
    let fansubName = '';
    let fansubDescription = '';
    let fansubLogo = '';

    let showSuccessModal = false;

    $: stats = data.stats;
    $: roleCounts = data.roleCounts;
    $: fansubs = data.fansubs;
    $: users = data.users;

    onMount(async () => {
        if (!data.user || (data.user.role !== 'admin' && data.user.role !== 'founder')) {
            goto('/');
            return;
        }

        await loadUsers();
        calculateStats();
    });

    function calculateStats() {
        stats.totalUsers = users.length;
        stats.bannedUsers = users.filter(u => u.isBanned).length;
        stats.activeUsers = stats.totalUsers - stats.bannedUsers;

        // Rolleri sıfırla
        Object.keys(stats.roles).forEach(role => stats.roles[role] = 0);

        // Rolleri say
        users.forEach(u => {
            if (stats.roles.hasOwnProperty(u.role)) {
                stats.roles[u.role]++;
            }
        });
    }

    async function loadUsers() {
        try {
            const response = await fetch('/api/users');
            const data = await response.json();
            users = data.users;
            calculateStats();
        } catch (err) {
            console.error('Kullanıcılar yüklenirken bir hata oluştu', err);
        }
    }

    async function handleBan(selectedUser) {
        if (selectedUser.discordId === data.user.userId) {
            console.error('Kendinizi banlayamazsınız!');
            return;
        }

        if (!banReason) {
            console.error('Ban sebebi girmelisiniz');
            return;
        }

        try {
            const response = await fetch('/api/users/ban', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    discordId: selectedUser.discordId,
                    reason: banReason
                })
            });

            if (!response.ok) throw new Error('Ban işlemi başarısız oldu');
            
            console.log('Kullanıcı başarıyla banlandı');
            selectedUser = null;
            banReason = '';
            await loadUsers();
        } catch (err) {
            console.error('Ban işlemi sırasında bir hata oluştu', err);
        }
    }

    async function handleUnban(user) {
        try {
            const response = await fetch('/api/users/ban', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discordId: user.discordId })
            });

            if (!response.ok) throw new Error('Ban kaldırma işlemi başarısız oldu');
            
            console.log('Ban başarıyla kaldırıldı');
            await loadUsers();
        } catch (err) {
            console.error('Ban kaldırma işlemi sırasında bir hata oluştu', err);
        }
    }

    function handleBanClick(user) {
        selectedUser = user;
        banReason = '';
    }

    function handleModalClose() {
        selectedUser = null;
        banReason = '';
    }

    function showSuccess() {
        showSuccessModal = true;
        setTimeout(() => {
            showSuccessModal = false;
        }, 2000);
    }
</script>

<div class="dashboard">
    <h1>Yönetici Paneli</h1>
    <div class="dashboard-content">
        <div class="stats-card">
            <h3>Kullanıcı İstatistikleri</h3>
            <!-- Buraya istatistikler eklenecek -->
        </div>
        
        <div class="management-section">
            <h3>Kullanıcı Yönetimi</h3>
            <!-- Buraya kullanıcı yönetim araçları eklenecek -->
        </div>
    </div>
</div>

<div class="dashboard-container">
    <div class="dashboard-header">
        <h1>Yönetim Paneli</h1>
    </div>

    <div class="grid">
        <!-- İstatistikler -->
        <div class="card">
            <h2>Kullanıcı İstatistikleri</h2>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-value">{stats.totalUsers}</span>
                    <span class="stat-label">Toplam Kullanıcı</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{stats.newUsers}</span>
                    <span class="stat-label">Son 24 Saat</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{stats.bannedUsers}</span>
                    <span class="stat-label">Yasaklı Kullanıcı</span>
                </div>
            </div>

            <h3 class="mt-4">Rol Dağılımı</h3>
            <div class="role-stats">
                {#each Object.entries(roleIcons) as [role, info]}
                    <div class="role-stat-item">
                        <div class="role-badge {info.color}">
                            <i class={info.icon}></i>
                            <span>{info.name}</span>
                        </div>
                        <span class="role-count">{roleCounts[role]}</span>
                    </div>
                {/each}
            </div>
        </div>

        <!-- Kullanıcı Listesi -->
        <div class="card">
            <h2>Kullanıcı Yönetimi</h2>
            <div class="users-list">
                {#each users.slice(0, showAllUsers ? undefined : 5) as user}
                    <div class="user-item" class:banned={user.isBanned}>
                        <img src={user.avatar || '/default-avatar.png'} alt={user.username} class="user-avatar" />
                        <div class="user-info">
                            <div class="username-container">
                                <span class="username" class:banned-text={user.isBanned}>{user.username}</span>
                                <div class="role-badge {roleIcons[user.role].color}">
                                    <i class={roleIcons[user.role].icon}></i>
                                    <span>{roleIcons[user.role].name}</span>
                                </div>
                                {#if user.isBanned}
                                    <span class="ban-badge">
                                        <i class="fas fa-ban"></i>
                                        Yasaklı
                                    </span>
                                {/if}
                            </div>
                            {#if user.isBanned}
                                <div class="ban-info">
                                    <span class="ban-reason">
                                        <i class="fas fa-info-circle"></i>
                                        {user.banReason || 'Sebep belirtilmemiş'}
                                    </span>
                                    <span class="ban-date">
                                        <i class="fas fa-clock"></i>
                                        {new Date(user.bannedAt).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                            {/if}
                        </div>
                        {#if user.role !== 'founder' && data.user?.role === 'founder' && user.discordId !== data.user.discordId}
                            <div class="user-actions">
                                {#if user.isBanned}
                                    <form 
                                        method="POST" 
                                        action="?/unban"
                                        use:enhance
                                    >
                                        <input type="hidden" name="userId" value={user.discordId} />
                                        <button class="unban-btn" type="submit">
                                            <i class="fas fa-unlock"></i>
                                            Yasağı Kaldır
                                        </button>
                                    </form>
                                {:else}
                                    <button class="ban-btn" on:click={() => handleBanClick(user)}>
                                        <i class="fas fa-ban"></i>
                                        Yasakla
                                    </button>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/each}

                {#if users.length > 5 && !showAllUsers}
                    <button class="show-more-btn" on:click={() => showAllUsers = true}>
                        Daha Fazla Göster ({users.length - 5})
                        <i class="fas fa-chevron-down"></i>
                    </button>
                {/if}
            </div>
        </div>

        <!-- Fansub Yönetimi -->
        <div class="card">
            <h2>Fansub Yönetimi</h2>
            <div class="fansubs-list">
                {#each fansubs as fansub}
                    <div class="fansub-card">
                        <div class="fansub-info">
                            {#if fansub.logo}
                                <img src={fansub.logo} alt={fansub.name} class="fansub-logo" />
                            {:else}
                                <div class="fansub-logo-placeholder">
                                    <i class="fas fa-users"></i>
                                </div>
                            {/if}
                            <div class="fansub-details">
                                <h3>{fansub.name}</h3>
                                <p class="fansub-description">{fansub.description}</p>
                            </div>
                        </div>
                        {#if data.user?.role === 'founder'}
                            <form 
                                method="POST" 
                                action="?/deleteFansub"
                                use:enhance
                                class="fansub-actions"
                            >
                                <input type="hidden" name="fansubId" value={fansub._id} />
                                <button class="delete-btn" type="submit">
                                    <i class="fas fa-trash"></i>
                                    Sil
                                </button>
                            </form>
                        {/if}
                    </div>
                {/each}

                {#if fansubs.length === 0}
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Henüz hiç fansub eklenmemiş</p>
                    </div>
                {/if}
            </div>

            {#if ['founder', 'admin'].includes(data.user?.role)}
                <form 
                    method="POST" 
                    action="?/addFansub"
                    use:enhance={() => {
                        return async ({ result }) => {
                            if (result.type === 'success') {
                                fansubName = '';
                                fansubDescription = '';
                                fansubLogo = '';
                                showSuccess();
                                await invalidateAll();
                            }
                        };
                    }}
                    class="add-fansub-form"
                >
                    <h3>Yeni Fansub Ekle</h3>
                    <div class="form-group">
                        <label for="name">Fansub Adı</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name"
                            bind:value={fansubName}
                            required
                            placeholder="Fansub adını girin"
                        />
                    </div>
                    <div class="form-group">
                        <label for="description">Açıklama</label>
                        <textarea 
                            id="description" 
                            name="description"
                            bind:value={fansubDescription}
                            required
                            placeholder="Fansub açıklamasını girin"
                            rows="3"
                        ></textarea>
                    </div>
                    <div class="form-group">
                        <label for="logo">Logo URL (İsteğe bağlı)</label>
                        <input 
                            type="url" 
                            id="logo" 
                            name="logo"
                            bind:value={fansubLogo}
                            placeholder="Logo URL'sini girin"
                        />
                    </div>
                    <button type="submit" class="submit-btn">
                        <i class="fas fa-plus"></i>
                        Fansub Ekle
                    </button>
                </form>
            {/if}
        </div>
    </div>
</div>

<!-- Ban Modal -->
{#if selectedUser}
    <div class="modal-backdrop" on:click={handleModalClose}>
        <div class="modal" on:click|stopPropagation>
            <h2>Kullanıcıyı Banla</h2>
            <p>"{selectedUser.username}" kullanıcısını banlamak üzeresiniz.</p>
            
            <form 
                method="POST" 
                action="?/ban"
                use:enhance
                class="ban-form"
            >
                <input type="hidden" name="userId" value={selectedUser.discordId} />
                
                <div class="form-group">
                    <label for="banReason">Ban Sebebi</label>
                    <textarea
                        id="banReason"
                        name="reason"
                        required
                        bind:value={banReason}
                        placeholder="Ban sebebini girin"
                        rows="3"
                    ></textarea>
                </div>

                <div class="modal-actions">
                    <button type="button" class="cancel-btn" on:click={handleModalClose}>İptal</button>
                    <button type="submit" class="confirm-btn">
                        <i class="fas fa-ban"></i>
                        Banla
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

{#if showSuccessModal}
    <div class="success-modal" transition:fly={{ y: 20, duration: 300 }}>
        <div class="modal-content" in:fade>
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h3>Fansub Başarıyla Eklendi!</h3>
        </div>
    </div>
{/if}

<style>
    .dashboard {
        padding: 2rem;
    }

    .dashboard-content {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
    }

    .stats-card, .management-section {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h1 {
        color: #333;
        margin-bottom: 2rem;
    }

    h3 {
        color: #555;
        margin-bottom: 1rem;
    }

    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .dashboard-header {
        margin-bottom: 2rem;
    }

    .dashboard-header h1 {
        font-size: 2rem;
        font-weight: 600;
        color: var(--ms-text);
    }

    .card {
        background: var(--ms-bg-secondary);
        border: 1px solid var(--ms-border);
        border-radius: 1rem;
        padding: 2rem;
    }

    .card h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        color: var(--ms-text);
    }

    .fansub-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-weight: 500;
        color: var(--ms-text);
    }

    .form-group input,
    .form-group textarea {
        padding: 0.75rem 1rem;
        border: 1px solid var(--ms-border);
        border-radius: 0.5rem;
        background: var(--ms-bg-primary);
        color: var(--ms-text);
        font-size: 0.95rem;
        transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--ms-primary);
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }

    .submit-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--ms-primary);
        color: white;
        border: none;
        border-radius: 0.5rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .submit-button:hover {
        background: var(--ms-primary-dark);
    }

    .submit-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .alert {
        padding: 1rem;
        border-radius: 0.5rem;
        font-size: 0.95rem;
    }

    .alert.error {
        background: var(--ms-danger-hover);
        color: var(--ms-danger);
        border: 1px solid var(--ms-danger);
    }

    .alert.success {
        background: var(--ms-success-hover);
        color: var(--ms-success);
        border: 1px solid var(--ms-success);
    }

    .grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }

    .users-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .user-item {
        background: var(--ms-bg-primary);
        border: 1px solid var(--ms-border);
        border-radius: 0.75rem;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }

    .user-item.banned {
        background: rgba(220, 53, 69, 0.05);
    }

    .user-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
    }

    .user-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .username-container {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .username {
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--ms-text);
    }

    .banned-text {
        text-decoration: line-through;
        opacity: 0.7;
    }

    .ban-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        background: var(--ms-danger);
        color: white;
        border-radius: 2rem;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .ban-badge i {
        font-size: 0.875rem;
    }

    .user-actions {
        display: flex;
        gap: 0.5rem;
        margin-left: auto;
    }

    .ban-btn, .unban-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
    }

    .ban-btn {
        background: var(--ms-danger);
        color: white;
    }

    .ban-btn:hover {
        background: var(--ms-danger-hover);
    }

    .unban-btn {
        background: var(--ms-success);
        color: white;
    }

    .unban-btn:hover {
        background: var(--ms-success-hover);
    }

    .ban-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.875rem;
        color: var(--ms-text);
        margin-top: 0.5rem;
    }

    .ban-reason, .ban-date {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .ban-reason i, .ban-date i {
        color: var(--ms-text-secondary);
        font-size: 0.875rem;
        width: 16px;
        text-align: center;
    }

    .show-more-btn {
        width: 100%;
        padding: 0.75rem;
        background: var(--ms-bg-secondary);
        border: 1px solid var(--ms-border);
        border-radius: 0.5rem;
        color: var(--ms-text);
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .show-more-btn:hover {
        background: var(--ms-hover);
    }

    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal {
        background: var(--ms-bg-secondary);
        padding: 2rem;
        border-radius: 1rem;
        width: 100%;
        max-width: 500px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .modal h2 {
        margin-bottom: 1rem;
        color: var(--ms-text);
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
    }

    .cancel-btn, .confirm-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.95rem;
        transition: all 0.2s ease;
    }

    .cancel-btn {
        background: var(--ms-bg-primary);
        color: var(--ms-text);
    }

    .confirm-btn {
        background: var(--ms-danger);
        color: white;
    }

    .confirm-btn:hover {
        background: var(--ms-danger-hover);
    }

    .confirm-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-item {
        background: var(--ms-bg-primary);
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
        border: 1px solid var(--ms-border);
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ms-primary);
        margin-bottom: 0.25rem;
    }

    .stat-label {
        font-size: 0.875rem;
        color: var(--ms-text-muted);
    }

    .role-stats {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .role-stat-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem;
        background: var(--ms-bg-primary);
        border-radius: 0.5rem;
        border: 1px solid var(--ms-border);
    }

    .role-count {
        font-weight: 500;
        color: var(--ms-text);
    }

    .mt-4 {
        margin-top: 1.5rem;
    }

    .fansubs-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .fansub-card {
        background: var(--ms-bg-secondary);
        border: 1px solid var(--ms-border);
        border-radius: 1rem;
        padding: 1.5rem;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        transition: transform 0.2s ease;
    }

    .fansub-card:hover {
        transform: translateY(-4px);
    }

    .fansub-info {
        display: flex;
        gap: 1.5rem;
        flex: 1;
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

    .fansub-details {
        flex: 1;
    }

    .fansub-details h3 {
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

    .fansub-actions {
        display: flex;
        gap: 0.5rem;
    }

    .delete-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--ms-danger);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
    }

    .delete-btn:hover {
        background: var(--ms-danger-hover);
    }

    .empty-state {
        text-align: center;
        padding: 3rem;
        color: var(--ms-text-secondary);
    }

    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .empty-state p {
        font-size: 1rem;
    }

    .add-fansub-form {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid var(--ms-border);
    }

    .add-fansub-form h3 {
        margin: 0 0 1.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--ms-text);
    }

    .submit-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background: var(--ms-primary);
        color: white;
        border: none;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s;
    }

    .submit-btn:hover {
        background: var(--ms-primary-hover);
    }

    .success-modal {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--ms-success);
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