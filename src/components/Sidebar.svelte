<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';

    /** @type {boolean} */
    export let isOpen;
    
    /** @type {import('$lib/types').User | null} */
    let user = null;
    
    /** @type {Record<string, { icon: string, name: string }>} */
    const roles = {
        user: { icon: 'fas fa-user', name: 'Üye' },
        admin: { icon: 'fas fa-star', name: 'Admin' },
        founder: { icon: 'fas fa-crown', name: 'Kurucu' }
    };

    $: user = $page.data.user;
    $: path = $page.url.pathname;

    onMount(() => {
        const mediaQuery = window.matchMedia('(max-width: 991.98px)');
        isOpen = !mediaQuery.matches;

        mediaQuery.addEventListener('change', (e) => {
            isOpen = !e.matches;
        });
    });

    function toggleSidebar() {
        isOpen = !isOpen;
    }
</script>

<div class="sidebar" class:open={isOpen}>
    <div class="logo">
        <a href="/" aria-label="Ana Sayfa">
            <img src="/images/logo.png" alt="Logo" />
        </a>
    </div>

    <nav aria-label="Ana Navigasyon">
        <ul>
            <li>
                <a
                    href="/"
                    class={path === '/' ? 'active' : ''}
                    aria-current={path === '/' ? 'page' : undefined}
                >
                    <i class="fas fa-home" aria-hidden="true"></i>
                    <span>Ana Sayfa</span>
                </a>
            </li>
            <li>
                <a href="/kesfet" class={path === '/kesfet' ? 'active' : ''}>
                    <i class="fas fa-compass" aria-hidden="true"></i>
                    <span>Keşfet</span>
                </a>
            </li>
            
            <div class="divider" role="separator"></div>

            <li>
                <a href="/fansublar" class={path === '/fansublar' ? 'active' : ''}>
                    <i class="fas fa-users" aria-hidden="true"></i>
                    <span>Fansublar</span>
                </a>
            </li>
            
            {#if user}
                <li>
                    <a
                        href="/profile/{user.username}"
                        class={path.startsWith('/profile') ? 'active' : ''}
                        aria-current={path.startsWith('/profile') ? 'page' : undefined}
                    >
                        <i class="fas fa-user" aria-hidden="true"></i>
                        <span>Profilim</span>
                    </a>
                </li>
            {/if}

            {#if user && (user.role === 'admin' || user.role === 'founder')}
                <div class="divider" role="separator"></div>
                <li>
                    <a href="/dashboard" class={path === '/dashboard' ? 'active' : ''}>
                        <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
                        <span>Yönetim Paneli</span>
                    </a>
                </li>
            {/if}

            <div class="divider" role="separator"></div>

            <li>
                <a href="/ayarlar" class={path === '/ayarlar' ? 'active' : ''}>
                    <i class="fas fa-cog" aria-hidden="true"></i>
                    <span>Ayarlar</span>
                </a>
            </li>
        </ul>
    </nav>
</div>

<style>
    .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        width: 250px;
        background: var(--ms-bg-secondary);
        border-right: 1px solid var(--ms-border);
        display: flex;
        flex-direction: column;
        z-index: 1000;
        transition: transform 0.3s ease;
    }

    .logo {
        padding: 1rem;
        text-align: center;
        border-bottom: 1px solid var(--ms-border);
    }

    .logo img {
        max-width: 120px;
        height: auto;
    }

    nav {
        flex: 1;
        overflow-y: auto;
        padding: 1rem 0;
    }

    nav ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    nav a {
        display: flex;
        align-items: center;
        padding: 0.75rem 1.5rem;
        color: var(--ms-text);
        text-decoration: none;
        transition: all 0.3s ease;
        border-radius: 0.5rem;
        margin: 0 0.5rem;
    }

    nav a:hover {
        background: var(--ms-hover);
        color: var(--ms-primary);
    }

    nav a.active {
        background: var(--ms-primary);
        color: white;
    }

    .sidebar-button {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.75rem 1.5rem;
        color: var(--ms-text);
        background: none;
        border: none;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.3s ease;
        border-radius: 0.5rem;
        margin: 0 0.5rem;
    }

    .sidebar-button:hover {
        background: var(--ms-hover);
        color: var(--ms-primary);
    }

    .sidebar-button i {
        width: 24px;
        margin-right: 12px;
        text-align: center;
        font-size: 1.1rem;
    }

    nav i {
        width: 24px;
        margin-right: 12px;
        text-align: center;
        font-size: 1.1rem;
    }

    .divider {
        height: 1px;
        background: var(--ms-border);
        margin: 1rem 0.5rem;
        opacity: 0.5;
    }

    @media (max-width: 991.98px) {
        .sidebar {
            transform: translateX(-100%);
            box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar.open {
            transform: translateX(0);
        }
    }
</style>
