<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { invalidateAll } from '$app/navigation';

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

    let searchQuery = '';
    $: filteredUsers = data.users.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.discordId.includes(searchQuery)
    );

    function formatDate(date) {
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    async function handleSubmit(event) {
        console.log('Form gönderiliyor...', {
            action: event.target.action,
            formData: Object.fromEntries(new FormData(event.target))
        });

        return async ({ result, update }) => {
            console.log('Form sonucu:', result);
            
            if (result.type === 'success') {
                console.log('İşlem başarılı, sayfa yenileniyor...');
                await invalidateAll();
            } else if (result.type === 'error') {
                console.error('Hata oluştu:', result.error);
                alert('İşlem sırasında bir hata oluştu: ' + result.error);
            }
            
            await update();
        };
    }
</script>

<div class="dashboard-container">
    <div class="dashboard-header">
        <div class="header-left">
            <h1>Kullanıcı Yönetimi</h1>
            <span class="user-count">{data.users.length} kullanıcı</span>
        </div>
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
                type="text" 
                bind:value={searchQuery} 
                placeholder="Kullanıcı ara..."
            />
        </div>
    </div>

    <div class="users-table">
        <table>
            <thead>
                <tr>
                    <th>Kullanıcı</th>
                    <th>Discord ID</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>Kayıt Tarihi</th>
                    <th>İşlemler</th>
                </tr>
            </thead>
            <tbody>
                {#each filteredUsers as user (user._id)}
                    <tr class:banned={user.isBanned}>
                        <td class="user-cell">
                            <img src={user.avatar || '/default-avatar.png'} alt={user.username} class="avatar" />
                            <div class="user-info">
                                <span class="username">{user.username}</span>
                                {#if user.isBanned}
                                    <span class="banned-date">
                                        {formatDate(user.bannedAt)} tarihinde yasaklandı
                                    </span>
                                {/if}
                            </div>
                        </td>
                        <td>{user.discordId}</td>
                        <td>
                            <div class="role-badge {roleIcons[user.role].color}">
                                <i class={roleIcons[user.role].icon}></i>
                                <span>{roleIcons[user.role].name}</span>
                            </div>
                        </td>
                        <td>
                            {#if user.isBanned}
                                <span class="status-badge banned">
                                    <i class="fas fa-ban"></i>
                                    Yasaklı
                                </span>
                            {:else}
                                <span class="status-badge active">
                                    <i class="fas fa-check-circle"></i>
                                    Aktif
                                </span>
                            {/if}
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                            {#if user.role !== 'founder' && $page.data.user?.role === 'founder'}
                                <form 
                                    method="POST" 
                                    action="?/{user.isBanned ? 'unban' : 'ban'}"
                                    use:enhance={handleSubmit}
                                >
                                    <input type="hidden" name="userId" value={user.discordId} />
                                    <button type="submit" class="action-btn {user.isBanned ? 'unban' : 'ban'}" title={user.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}>
                                        <i class="fas {user.isBanned ? 'fa-user-check' : 'fa-user-slash'}"></i>
                                        <span>{user.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}</span>
                                    </button>
                                </form>
                            {/if}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    .dashboard-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
    }

    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .header-left {
        display: flex;
        align-items: baseline;
        gap: 1rem;
    }

    .header-left h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--ms-text);
    }

    .user-count {
        color: var(--ms-text-secondary);
        font-size: 0.875rem;
    }

    .search-box {
        position: relative;
        width: 300px;
    }

    .search-box input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid var(--ms-border);
        border-radius: 0.5rem;
        background: var(--ms-bg-primary);
        color: var(--ms-text);
        font-size: 0.875rem;
    }

    .search-box i {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--ms-text-secondary);
    }

    .users-table {
        background: var(--ms-bg-secondary);
        border-radius: 0.75rem;
        overflow: hidden;
        border: 1px solid var(--ms-border);
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid var(--ms-border);
    }

    th {
        background: var(--ms-bg-primary);
        font-weight: 500;
        color: var(--ms-text-secondary);
        font-size: 0.875rem;
    }

    .user-cell {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .username {
        font-weight: 500;
        color: var(--ms-text);
    }

    .banned-date {
        font-size: 0.75rem;
        color: var(--ms-text-secondary);
    }

    .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
    }

    .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 2rem;
        font-size: 0.875rem;
        background: var(--ms-bg-primary);
        border: 1px solid var(--ms-border);
    }

    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.75rem;
        border-radius: 2rem;
        font-size: 0.875rem;
    }

    .status-badge i {
        font-size: 0.75rem;
    }

    .status-badge.active {
        background: rgba(25, 135, 84, 0.1);
        color: #198754;
    }

    .status-badge.banned {
        background: rgba(220, 53, 69, 0.1);
        color: #dc3545;
    }

    .action-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        background: var(--ms-bg-primary);
        color: var(--ms-text);
    }

    .action-btn.ban {
        background: #ef4444;
        color: white;
    }

    .action-btn.unban {
        background: #22c55e;
        color: white;
    }

    .action-btn:hover {
        opacity: 0.9;
    }

    .action-btn i {
        font-size: 0.875rem;
    }

    tr.banned {
        background: rgba(220, 53, 69, 0.05);
    }

    :global(.text-yellow-500) { color: #eab308 !important; }
    :global(.text-blue-500) { color: #3b82f6 !important; }
    :global(.text-green-500) { color: #22c55e !important; }
    :global(.text-purple-500) { color: #a855f7 !important; }
    :global(.text-orange-500) { color: #f97316 !important; }
    :global(.text-gray-500) { color: #6b7280 !important; }
</style> 