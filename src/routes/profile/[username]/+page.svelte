<script lang="ts">
    import type { PageData } from './$types';
    import { page } from '$app/stores';

    interface Profile {
        username: string;
        avatar?: string;
        isPrivate: boolean;
        bio?: string;
        role: string;
    }

    type Data = {
        profile: Profile;
        isOwner: boolean;
    }

    /** @type {import('./$types').PageData} */
    export let data: Data;
    let { profile, isOwner } = data;
    let isEditing = false;
    let isPrivate = profile.isPrivate;
    let isLoading = false;

    const roleIcons = {
        founder: { icon: 'fas fa-crown', color: 'text-yellow-500', name: 'Kurucu' },
        admin: { icon: 'fas fa-star', color: 'text-blue-500', name: 'Admin' },
        developer: { icon: 'fas fa-code', color: 'text-green-500', name: 'Geliştirici' },
        guide: { icon: 'fas fa-compass', color: 'text-purple-500', name: 'Rehber' },
        contributor: { icon: 'fas fa-pen', color: 'text-orange-500', name: 'Paylaşımcı' },
        user: { icon: 'fas fa-user', color: 'text-gray-500', name: 'Üye' }
    };

    async function togglePrivacy() {
        isLoading = true;
        try {
            const response = await fetch(`/api/profile/${profile.username}/privacy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    isPrivate: !isPrivate
                })
            });

            const data = await response.json();
            
            if (data.success) {
                isPrivate = !isPrivate;
                profile.isPrivate = isPrivate;
                if ($page.data.user) {
                    $page.data.user.isPrivate = isPrivate;
                }
            }
        } catch (error) {
            console.error('Gizlilik ayarı güncellenirken hata oluştu:', error);
        } finally {
            isLoading = false;
        }
    }
</script>

{#if profile?.isPrivate && !isOwner}
    <div class="private-profile">
        <i class="fas fa-lock"></i>
        <p>Bu profil gizli.</p>
    </div>
{:else}
    <div class="profile-container">
        <div class="profile-header">
            <div class="profile-avatar">
                <img src={profile?.avatar || '/favicon.png'} alt={profile?.username || "UnU"} />
            </div>
            <div class="profile-info">
                <div class="profile-username">
                    <h1>{profile.username}</h1>
                    <div class="role-badge">
                        <i class={roleIcons[profile.role].icon} class:text-yellow-500={profile.role === 'founder'} 
                           class:text-blue-500={profile.role === 'admin'}
                           class:text-green-500={profile.role === 'developer'}
                           class:text-purple-500={profile.role === 'guide'}
                           class:text-orange-500={profile.role === 'contributor'}
                           class:text-gray-500={profile.role === 'user'}></i>
                        <span>{roleIcons[profile.role].name}</span>
                    </div>
                    {#if profile.isPrivate}
                        <span class="privacy-badge">Gizli Profil</span>
                    {/if}
                </div>
                {#if isOwner}
                    <div class="profile-actions">
                        <button 
                            class="privacy-toggle" 
                            on:click={togglePrivacy} 
                            disabled={isLoading}
                        >
                            <i class="fas {isPrivate ? 'fa-lock' : 'fa-lock-open'}"></i>
                            {isLoading ? 'Yükleniyor...' : (isPrivate ? 'Profili Herkese Aç' : 'Profili Gizle')}
                        </button>
                        <button 
                            class="btn-logout" 
                            on:click={() => window.location.href = '/auth/logout'}
                        >
                            <i class="fas fa-sign-out-alt"></i>
                            Oturumu Kapat
                        </button>
                    </div>
                {/if}
            </div>
        </div>
        <div class="profile-content">
            <div class="profile-section">
                <h2>Hakkında</h2>
                <p>{profile.bio || 'Henüz bir biyografi eklenmemiş.'}</p>
            </div>
        </div>
    </div>
{/if}

<style>
    .profile-container {
        max-width: 800px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .profile-header {
        display: flex;
        gap: 2rem;
        align-items: center;
        margin-bottom: 2rem;
    }

    .profile-avatar {
        width: 150px;
        height: 150px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid var(--ms-primary);
    }

    .profile-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .profile-info {
        flex: 1;
    }

    .profile-username {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .profile-username h1 {
        margin: 0;
        color: var(--ms-text);
        font-size: 2rem;
    }

    .privacy-badge {
        background: var(--ms-warning);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
    }

    .profile-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    .privacy-toggle, .btn-logout {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border: none;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
    }

    .privacy-toggle {
        background: var(--ms-primary);
        color: white;
    }

    .privacy-toggle:hover {
        background: var(--ms-primary-hover);
    }

    .privacy-toggle:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .btn-logout {
        background: var(--ms-danger);
        color: white;
    }

    .btn-logout:hover {
        background: var(--ms-danger-hover);
    }

    .private-profile {
        text-align: center;
        padding: 3rem;
        background: var(--ms-bg-secondary);
        border-radius: 0.75rem;
        color: var(--ms-text-light);
    }

    .private-profile i {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .profile-content {
        display: grid;
        gap: 2rem;
    }

    .profile-section {
        background: var(--ms-bg-secondary);
        padding: 1.5rem;
        border-radius: 0.75rem;
        border: 1px solid var(--ms-border);
    }

    .profile-section h2 {
        color: var(--ms-text);
        font-size: 1.25rem;
        margin-bottom: 1rem;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 1rem;
    }

    .stat-item {
        text-align: center;
        padding: 1rem;
        background: var(--ms-bg);
        border-radius: 0.5rem;
    }

    .stat-value {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--ms-primary);
        margin-bottom: 0.25rem;
    }

    .stat-label {
        color: var(--ms-text-light);
        font-size: 0.875rem;
    }

    .role-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--ms-bg-primary);
        border: 1px solid var(--ms-border);
        border-radius: 2rem;
        margin-top: 0.75rem;
        font-size: 0.95rem;
    }

    @media (max-width: 576px) {
        .profile-header {
            flex-direction: column;
            text-align: center;
        }

        .profile-avatar {
            margin: 0 auto;
        }

        .profile-username {
            justify-content: center;
        }

        .profile-actions {
            justify-content: center;
        }
    }

    :global(.text-yellow-500) { color: #eab308; }
    :global(.text-blue-500) { color: #3b82f6; }
    :global(.text-green-500) { color: #22c55e; }
    :global(.text-purple-500) { color: #a855f7; }
    :global(.text-orange-500) { color: #f97316; }
    :global(.text-gray-500) { color: #6b7280; }
</style> 