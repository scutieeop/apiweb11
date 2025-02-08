<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    let loading = false;

    const handleDiscordLogin = () => {
        loading = true;
        const DISCORD_CLIENT_ID = import.meta.env.VITE_DISCORD_CLIENT_ID;
        const REDIRECT_URI = encodeURIComponent('http://localhost:3000/auth/discord/callback');
        const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20email`;
        
        window.location.href = DISCORD_AUTH_URL;
    };

    const closeModal = () => {
        dispatch('close');
    };
</script>

<div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content auth-modal">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Kapat">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="auth-header">
                <img src="/images/logo.png" alt="Logo" class="auth-logo-img">
                <h4 class="auth-title" id="authModalLabel">Hoş Geldiniz</h4>
                <p class="auth-subtitle">Devam etmek için Discord ile giriş yapın</p>
            </div>

            <div class="social-login">
                <button class="btn btn-discord" on:click={handleDiscordLogin} disabled={loading}>
                    <i class="fab fa-discord"></i>
                    {#if loading}
                        Discord ile Giriş Yapılıyor...
                    {:else}
                        Discord ile Devam Et
                    {/if}
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    .auth-modal {
        background: var(--ms-bg-secondary);
        padding: 2rem;
        border-radius: 0.75rem;
        border: 1px solid var(--ms-border);
        max-width: 30rem;
        width: 100%;
        margin: 0 auto;
    }

    .btn-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        color: var(--ms-text-light);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0.5rem;
        transition: color 0.2s ease;
    }

    .btn-close:hover {
        color: var(--ms-text);
    }

    .auth-header {
        text-align: center;
        margin-bottom: 2rem;
    }

    .auth-logo-img {
        height: 3rem;
        margin-bottom: 1rem;
    }

    .auth-title {
        font-size: 1.5rem;
        color: var(--ms-text);
        margin-bottom: 0.5rem;
    }

    .auth-subtitle {
        color: var(--ms-text-light);
        font-size: 0.875rem;
    }

    .social-login {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .btn {
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .btn-discord {
        background: #5865F2;
        color: white;
        border: none;
    }

    .btn-discord:hover:not(:disabled) {
        background: #4752c4;
    }

    .btn-discord:disabled {
        background: #99AAB5;
        cursor: not-allowed;
    }

    @media (max-width: 576px) {
        .auth-modal {
            margin: 1rem;
            width: calc(100% - 2rem);
            padding: 1.5rem;
        }

        .auth-title {
            font-size: 1.25rem;
        }

        .auth-subtitle {
            font-size: 0.8125rem;
        }
    }
</style> 