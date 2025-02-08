<script>
    import { config } from '$lib/config';
    import { onMount } from 'svelte';

    let showTooltip = false;
    let tooltipTimer;

    function handleLogin() {
        if (!config.DISCORD_LOGIN_ENABLED) {
            showTooltip = true;
            
            // 5 saniye sonra tooltip'i kapat
            if (tooltipTimer) clearTimeout(tooltipTimer);
            tooltipTimer = setTimeout(() => {
                showTooltip = false;
            }, 5000);
            
            return;
        }
        
        // Discord login aktifse yönlendir
        window.location.href = '/auth/discord';
    }

    onMount(() => {
        return () => {
            if (tooltipTimer) clearTimeout(tooltipTimer);
        };
    });
</script>

<div class="login-container">
    <button 
        class="login-button" 
        class:disabled={!config.DISCORD_LOGIN_ENABLED}
        on:click={handleLogin}
    >
        <i class="fab fa-discord"></i>
        Discord ile Giriş Yap
    </button>

    {#if showTooltip}
        <div class="tooltip" role="tooltip">
            {config.DISCORD_ACCESS_MESSAGE}
        </div>
    {/if}
</div>

<style>
    .login-container {
        position: relative;
        display: inline-block;
    }

    .login-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 8px;
        background: #5865F2;
        color: white;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .login-button:hover:not(.disabled) {
        background: #4752c4;
        transform: translateY(-2px);
    }

    .login-button.disabled {
        background: #36393f;
        cursor: not-allowed;
        opacity: 0.8;
    }

    .tooltip {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: 0.5rem;
        padding: 0.75rem 1rem;
        background: #36393f;
        color: white;
        border-radius: 6px;
        font-size: 0.9rem;
        white-space: nowrap;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
    }

    .tooltip::before {
        content: '';
        position: absolute;
        top: -6px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 0 6px 6px 6px;
        border-style: solid;
        border-color: transparent transparent #36393f transparent;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -10px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }

    i {
        font-size: 1.2rem;
    }
</style> 