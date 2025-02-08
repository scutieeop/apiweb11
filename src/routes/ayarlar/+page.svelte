<script>
    import { onMount } from 'svelte';

    let theme = 'dark';
    let videoQuality = 'auto';
    let autoplay = true;
    let notifications = false;

    onMount(() => {
        // Kayıtlı ayarları yükle
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            theme = settings.theme || 'dark';
            videoQuality = settings.videoQuality || 'auto';
            autoplay = settings.autoplay ?? true;
            notifications = settings.notifications ?? false;
        }

        // Temayı uygula
        document.documentElement.setAttribute('data-theme', theme);
    });

    function saveSettings() {
        const settings = {
            theme,
            videoQuality,
            autoplay,
            notifications
        };
        localStorage.setItem('userSettings', JSON.stringify(settings));
        document.documentElement.setAttribute('data-theme', theme);
    }
</script>

<div class="settings-container">
    <div class="settings-header">
        <h1>Ayarlar</h1>
        <p>Tercihlerinizi buradan yönetebilirsiniz</p>
    </div>

    <div class="settings-section">
        <h2>Görünüm</h2>
        <div class="setting-item">
            <label for="theme">Tema</label>
            <select id="theme" bind:value={theme} on:change={saveSettings}>
                <option value="dark">Koyu Tema</option>
                <option value="light">Açık Tema</option>
            </select>
        </div>
    </div>

    <div class="settings-section">
        <h2>Video Ayarları</h2>
        <div class="setting-item">
            <label for="quality">Video Kalitesi</label>
            <select id="quality" bind:value={videoQuality} on:change={saveSettings}>
                <option value="auto">Otomatik</option>
                <option value="1080p">1080p</option>
                <option value="720p">720p</option>
                <option value="480p">480p</option>
                <option value="360p">360p</option>
            </select>
        </div>
        <div class="setting-item">
            <label for="autoplay">Otomatik Oynatma</label>
            <label class="switch">
                <input 
                    type="checkbox" 
                    id="autoplay"
                    bind:checked={autoplay} 
                    on:change={saveSettings}
                >
                <span class="slider"></span>
            </label>
        </div>
    </div>

    <div class="settings-section">
        <h2>Bildirimler</h2>
        <div class="setting-item">
            <label for="notifications">Yeni Bölüm Bildirimleri</label>
            <label class="switch">
                <input 
                    type="checkbox" 
                    id="notifications"
                    bind:checked={notifications} 
                    on:change={saveSettings}
                >
                <span class="slider"></span>
            </label>
        </div>
    </div>
</div>

<style>
    .settings-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
    }

    .settings-header {
        margin-bottom: 2rem;
    }

    .settings-header h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: var(--ms-text);
    }

    .settings-header p {
        color: var(--ms-text-secondary);
    }

    .settings-section {
        background: var(--ms-bg-secondary);
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .settings-section h2 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        color: var(--ms-text);
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--ms-border);
    }

    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 0;
    }

    .setting-item:not(:last-child) {
        border-bottom: 1px solid var(--ms-border);
    }

    .setting-item label {
        color: var(--ms-text);
        font-weight: 500;
    }

    select {
        background: var(--ms-bg-primary);
        color: var(--ms-text);
        border: 1px solid var(--ms-border);
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-size: 0.9rem;
        cursor: pointer;
    }

    select:hover {
        border-color: var(--ms-primary);
    }

    /* Switch styles */
    .switch {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 24px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--ms-bg-primary);
        transition: .4s;
        border-radius: 24px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: var(--ms-primary);
    }

    input:checked + .slider:before {
        transform: translateX(26px);
    }

    @media (max-width: 768px) {
        .settings-container {
            padding: 1rem;
        }

        .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
        }

        select {
            width: 100%;
        }
    }
</style> 