<script>
    // Social media links
    const socialLinks = [
        { icon: 'fab fa-twitter', url: '#' },
        { icon: 'fab fa-instagram', url: '#' },
        { icon: 'fab fa-discord', url: '#' }
    ];

    // Store images
    const storeLinks = [
        
    ];

    // Sidebar toggle functionality
    let sidebar;
    
    function toggleSidebar() {
        if (sidebar) {
            sidebar.classList.toggle('show');
        }
    }

    function handleClickOutside(event) {
        if (window.innerWidth < 992 && 
            sidebar?.classList.contains('show') && 
            !sidebar.contains(event.target) && 
            event.target.id !== 'sidebarToggle') {
            sidebar.classList.remove('show');
        }
    }
</script>

<footer>
    <div class="container">
        <div class="row g-4">
            <div class="col-md-3">
                <h5 class="mb-3">Animax</h5>
                <p class="small">Modern anime izleme deneyimi için buradayız. En yeni ve popüler animeleri keşfedin.</p>
            </div>
            <div class="col-md-3">
                <h5 class="mb-3">Keşfet</h5>
                <ul class="list-unstyled">
                    <li><a href="/populer">Popüler Animeler</a></li>
                    <li><a href="/yeni">Yeni Çıkanlar</a></li>
                    <li><a href="/kategoriler">Kategoriler</a></li>
                    <li><a href="/sezon">Sezon Animeleri</a></li>
                </ul>
            </div>
            <div class="col-md-3">
                <h5 class="mb-3">Yardım</h5>
                <ul class="list-unstyled">
                    <li><a href="/hakkimizda">Hakkımızda</a></li>
                    <li><a href="/iletisim">İletişim</a></li>
                    <li><a href="/sss">SSS</a></li>
                    <li><a href="/gizlilik">Gizlilik Politikası</a></li>
                </ul>
            </div>
            <div class="col-md-3">
                <h5 class="mb-3">Bizi Takip Edin</h5>
                <div class="d-flex gap-2">
                    {#each socialLinks as link}
                        <a href={link.url} class="btn btn-sm btn-outline-secondary">
                            <i class={link.icon}></i>
                        </a>
                    {/each}
                </div>
            </div>
        </div>
        <hr class="my-4">
        <div class="row align-items-center">
            <div class="col-md-6">
                <p class="small mb-0">&copy; 2024 Animax. Tüm hakları saklıdır.</p>
            </div>
            <div class="col-md-6 text-md-end">
                {#each storeLinks as store, i}
                    <img 
                        src={store.src} 
                        alt={store.alt} 
                        height={store.height} 
                        class={i === 0 ? 'me-2' : ''}
                    >
                {/each}
            </div>
        </div>
    </div>
</footer>

<svelte:window on:click={handleClickOutside}/>

<style>
    /* Add any component-specific styles here */
</style>
