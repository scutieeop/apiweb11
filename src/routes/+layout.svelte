<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { browser } from '$app/environment';
    import Footer from '../components/Footer.svelte';
    import AuthModal from '../components/AuthModal.svelte';

    let isMobile = false;
    let isSearchOpen = false;
    let searchQuery = '';
    let searchResults = [];

    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth <= 768;
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    });

    async function handleSearch() {
        if (searchQuery.length < 2) return;
        
        try {
            const response = await fetch(`/api/kesfet/search?q=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) throw new Error('Arama başarısız');
            
            const data = await response.json();
            searchResults = data.slice(0, 5);
        } catch (err) {
            console.error('Arama hatası:', err);
            searchResults = [];
        }
    }

    function toggleSearch() {
        isSearchOpen = !isSearchOpen;
        if (!isSearchOpen) {
            searchQuery = '';
            searchResults = [];
        }
    }

    $: currentPath = $page.url.pathname;
</script>

<div class="app-container">
    <!-- Navbar -->
    <nav class="navbar">
        <div class="navbar-content">
            <div class="navbar-brand">
                <a href="/" class="logo">
                    <img src="/logo.png" alt="Animax" />
                </a>
            </div>

            <div class="navbar-actions">
                <a href="/auth/discord" class="discord-button">
                    <i class="fab fa-discord"></i>
                    Discord ile Giriş Yap
                </a>
            </div>
        </div>
    </nav>
    
    {#if !isMobile}
        <!-- Sidebar -->
        <aside class="sidebar">
            <nav class="sidebar-nav">
                <a 
                    href="/" 
                    class="nav-item" 
                    class:active={currentPath === '/'}
                >
                    <i class="fas fa-home"></i>
                    <span>Ana Sayfa</span>
                </a>
                <a 
                    href="/kesfet" 
                    class="nav-item"
                    class:active={currentPath.startsWith('/kesfet')}
                >
                    <i class="fas fa-compass"></i>
                    <span>Keşfet</span>
                </a>
                <a 
                    href="/yeni-bolumler" 
                    class="nav-item"
                    class:active={currentPath.startsWith('/yeni-bolumler')}
                >
                    <i class="fas fa-play-circle"></i>
                    <span>Yeni Bölümler</span>
                </a>
                <a 
                    href="/fansubs" 
                    class="nav-item"
                    class:active={currentPath.startsWith('/fansubs')}
                >
                    <i class="fas fa-users"></i>
                    <span>Fansub'lar</span>
                </a>
            </nav>

            <div class="sidebar-footer">
                <a 
                    href="/ayarlar" 
                    class="nav-item settings-item"
                    class:active={currentPath.startsWith('/ayarlar')}
                >
                    <i class="fas fa-cog"></i>
                    <span>Ayarlar</span>
                </a>
            </div>
        </aside>
    {/if}
    
    <div class="main-content">
        <main>
            <slot />
        </main>
        <Footer />
    </div>

    {#if isMobile}
        <!-- Mobile Bottom Navigation -->
        <nav class="mobile-nav">
            <a 
                href="/" 
                class="mobile-nav-item" 
                class:active={currentPath === '/'}
            >
                <i class="fas fa-home"></i>
                <span>Ana Sayfa</span>
            </a>
            <a 
                href="/kesfet" 
                class="mobile-nav-item"
                class:active={currentPath.startsWith('/kesfet')}
            >
                <i class="fas fa-compass"></i>
                <span>Keşfet</span>
            </a>
            <a 
                href="/yeni-bolumler" 
                class="mobile-nav-item"
                class:active={currentPath.startsWith('/yeni-bolumler')}
            >
                <i class="fas fa-play-circle"></i>
                <span>Yeni</span>
            </a>
            <a 
                href="/profil" 
                class="mobile-nav-item"
                class:active={currentPath.startsWith('/profil')}
            >
                <i class="fas fa-user"></i>
                <span>Profil</span>
            </a>
        </nav>
    {/if}
</div>

<AuthModal />

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
        background-color: #1a1d24;
        color: #fff;
        overflow-x: hidden;
    }

    .app-container {
        display: flex;
        min-height: 100vh;
        background-color: #1a1d24;
        position: relative;
        padding-top: 60px; /* Navbar height */
    }

    /* Navbar Styles */
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: #1a1d24;
        border-bottom: 1px solid #2a2e35;
        z-index: 1000;
    }

    .navbar-content {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
    }

    .logo img {
        height: 32px;
        width: auto;
    }

    .navbar-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .discord-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: #5865F2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: 500;
        font-size: 0.9rem;
    }

    .discord-button:hover {
        background: #4752c4;
    }

    /* Sidebar Styles */
    .sidebar {
        position: fixed;
        left: 0;
        top: 60px;
        bottom: 0;
        width: 240px;
        background: #1a1d24;
        border-right: 1px solid #2a2e35;
        display: flex;
        flex-direction: column;
        z-index: 900;
    }

    .sidebar-header {
        padding: 1rem;
        border-bottom: 1px solid #2a2e35;
    }

    .search-container {
        display: flex;
        align-items: center;
        background: #2a2e35;
        border-radius: 4px;
        padding: 0.5rem;
    }

    .search-icon {
        color: #6c757d;
        margin-right: 0.5rem;
    }

    .search-container input {
        flex: 1;
        background: none;
        border: none;
        color: #fff;
        font-size: 0.9rem;
    }

    .search-container input::placeholder {
        color: #6c757d;
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #2a2e35;
        border: 1px solid #2a2e35;
        border-radius: 4px;
        margin-top: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .search-result-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        text-decoration: none;
        color: #fff;
    }

    .search-result-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .search-result-item img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;
    }

    .result-meta {
        font-size: 0.8rem;
        color: #6c757d;
    }

    .sidebar-nav {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .nav-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem;
        color: #fff;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    .nav-item.active {
        background: #2a2e35;
    }

    .nav-item i {
        width: 20px;
        text-align: center;
        font-size: 1.1rem;
    }

    .sidebar-footer {
        margin-top: auto;
        padding: 1rem;
        border-top: 1px solid var(--ms-border);
    }

    .settings-item {
        color: var(--ms-text-secondary);
    }

    .settings-item:hover {
        color: var(--ms-primary);
        background: var(--ms-hover);
    }

    .settings-item.active {
        color: var(--ms-primary);
        background: var(--ms-hover);
    }

    /* Main Content Styles */
    .main-content {
        flex: 1;
        margin-left: 240px;
        background-color: #1a1d24;
        min-height: 100vh;
    }

    main {
        padding: 2rem;
    }

    /* Mobile Navigation Styles */
    .mobile-nav {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: var(--ms-bg);
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 0.5rem;
        z-index: 1000;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        border-top: 1px solid var(--ms-border);
    }

    .mobile-nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        color: var(--ms-text-secondary);
        text-decoration: none;
        font-size: 0.75rem;
        padding: 0.5rem;
        min-width: 60px;
        border-radius: 8px;
        transition: all 0.2s ease;
    }

    .mobile-nav-item i {
        font-size: 1.25rem;
    }

    .mobile-nav-item:hover,
    .mobile-nav-item.active {
        color: var(--ms-primary);
        background: var(--ms-hover);
    }

    /* Responsive Styles */
    @media (max-width: 768px) {
        .navbar-brand .logo span {
            display: none;
        }

        .discord-button span {
            display: none;
        }

        .main-content {
            margin-left: 0;
        }

        .search-results {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 60px;
            margin: 0;
            border-radius: 0;
            overflow-y: auto;
        }
    }
</style>
