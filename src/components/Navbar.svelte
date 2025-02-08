<script lang="ts">
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import LoginButton from './LoginButton.svelte';

    $: user = $page.data.user;
    let isDarkMode = true;
    let searchQuery = '';
    let isDropdownOpen = false;
    let isSearchOpen = false;
    let searchResults = [];
    let isMobile = false;

    onMount(() => {
        const htmlElement = document.documentElement;
        isDarkMode = htmlElement.classList.contains('dark-theme');

        const checkMobile = () => {
            isMobile = window.innerWidth <= 768;
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    });

    function toggleTheme() {
        isDarkMode = !isDarkMode;
        const htmlElement = document.documentElement;
        
        if (isDarkMode) {
            htmlElement.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    }

    function toggleDropdown() {
        isDropdownOpen = !isDropdownOpen;
    }

    function handleClickOutside(event) {
        if (!event.target.closest('.user-dropdown')) {
            isDropdownOpen = false;
        }
    }

    async function handleLogout() {
        try {
            const response = await fetch('/auth/logout');
            if (response.ok) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Çıkış yapılırken hata oluştu:', error);
        }
    }

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
</script>

<svelte:window on:click={handleClickOutside}/>

<nav class="navbar">
    <div class="navbar-content">
        <div class="navbar-brand">
            <a href="/" class="logo">
                <i class="fas fa-play-circle"></i>
                <span>Animax</span>
            </a>
        </div>

        <div class="navbar-search" class:active={isSearchOpen}>
            <div class="search-container">
                <input
                    type="text"
                    placeholder="Anime ara..."
                    bind:value={searchQuery}
                    on:input={handleSearch}
                />
                <button class="search-button" on:click={toggleSearch}>
                    {#if isSearchOpen}
                        <i class="fas fa-times"></i>
                    {:else}
                        <i class="fas fa-search"></i>
                    {/if}
                </button>
            </div>

            {#if searchResults.length > 0 && isSearchOpen}
                <div class="search-results">
                    {#each searchResults as result}
                        <a href="/anime/{result.id}" class="search-result-item">
                            <img src={result.coverImage} alt={result.name} />
                            <div class="result-info">
                                <span class="result-title">{result.name}</span>
                                <span class="result-meta">{result.episodeCount} Bölüm</span>
                            </div>
                        </a>
                    {/each}
                </div>
            {/if}
        </div>

        <div class="navbar-actions">
            <LoginButton />
        </div>
    </div>
</nav>

<style>
    .navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 60px;
        background: var(--ms-bg-secondary);
        border-bottom: 1px solid var(--ms-border);
        z-index: 1000;
    }

    .navbar-content {
        max-width: 1400px;
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
        gap: 1rem;
    }

    .navbar-brand {
        flex-shrink: 0;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--ms-primary);
        text-decoration: none;
        font-size: 1.5rem;
        font-weight: 700;
    }

    .navbar-search {
        flex: 1;
        max-width: 600px;
        position: relative;
    }

    .search-container {
        display: flex;
        align-items: center;
        background: var(--ms-bg-primary);
        border-radius: 8px;
        overflow: hidden;
    }

    .search-container input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        color: var(--ms-text);
        font-size: 0.9rem;
    }

    .search-container input::placeholder {
        color: var(--ms-text-secondary);
    }

    .search-button {
        padding: 0.75rem;
        border: none;
        background: transparent;
        color: var(--ms-text-secondary);
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .search-button:hover {
        color: var(--ms-primary);
    }

    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        margin-top: 0.5rem;
        background: var(--ms-bg-secondary);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        z-index: 1000;
    }

    .search-result-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        text-decoration: none;
        color: var(--ms-text);
        transition: all 0.2s ease;
    }

    .search-result-item:hover {
        background: var(--ms-hover);
    }

    .search-result-item img {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        object-fit: cover;
    }

    .result-info {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .result-title {
        font-weight: 500;
    }

    .result-meta {
        font-size: 0.8rem;
        color: var(--ms-text-secondary);
    }

    @media (max-width: 768px) {
        .navbar {
            height: 50px;
        }

        .navbar-content {
            padding: 0 0.5rem;
        }

        .logo span {
            display: none;
        }

        .navbar-search {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            padding: 0.5rem;
            background: var(--ms-bg-secondary);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        }

        .navbar-search.active {
            transform: translateY(0);
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

        .search-result-item {
            padding: 1rem;
        }

        .search-result-item img {
            width: 50px;
            height: 50px;
        }
    }
</style>
