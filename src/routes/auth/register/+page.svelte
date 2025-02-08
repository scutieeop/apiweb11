<script lang="ts">
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import type { ActionResult, SubmitFunction } from '@sveltejs/kit';

    let username = '';
    let email = '';
    let password = '';
    let confirmPassword = '';
    let error: string | null = null;
    let loading = false;

    const handleSubmit: SubmitFunction = () => {
        loading = true;
        
        if (password !== confirmPassword) {
            error = 'Şifreler eşleşmiyor';
            loading = false;
            return;
        }

        return async ({ result, update }) => {
            loading = false;
            
            if (result.type === 'failure') {
                error = result.data?.error;
                await update();
            } else if (result.type === 'redirect') {
                await goto(result.location);
            }
        };
    }

    const handleDiscordLogin = () => {
        loading = true;
        const DISCORD_CLIENT_ID = import.meta.env.DISCORD_CLIENT_ID;
        const REDIRECT_URI = encodeURIComponent('http://localhost:3000/auth/discord/callback');
        const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20email`;
        
        window.location.href = DISCORD_AUTH_URL;
    };
</script>

<div class="container">
    <div class="auth-form">
        <h2>Kayıt Ol</h2>
        {#if error}
            <div class="error">{error}</div>
        {/if}
        <form method="post" use:enhance={handleSubmit}>
            <div class="form-group">
                <label for="username">Kullanıcı Adı</label>
                <input 
                    type="text" 
                    id="username"
                    name="username" 
                    bind:value={username}
                    required 
                    minlength="3"
                    maxlength="50"
                />
            </div>
            <div class="form-group">
                <label for="email">E-posta</label>
                <input 
                    type="email" 
                    id="email"
                    name="email" 
                    bind:value={email}
                    required 
                />
            </div>
            <div class="form-group">
                <label for="password">Şifre</label>
                <input 
                    type="password" 
                    id="password"
                    name="password" 
                    bind:value={password}
                    required 
                    minlength="6"
                />
            </div>
            <div class="form-group">
                <label for="confirmPassword">Şifre Tekrar</label>
                <input 
                    type="password" 
                    id="confirmPassword"
                    name="confirmPassword" 
                    bind:value={confirmPassword}
                    required 
                    minlength="6"
                />
            </div>
            <button type="submit" disabled={loading}>
                {#if loading}
                    Kaydediliyor...
                {:else}
                    Kayıt Ol
                {/if}
            </button>
        </form>
        <button class="discord-button" on:click={handleDiscordLogin} disabled={loading}>
            <img src="/discord-logo.png" alt="Discord Logo" />
            {#if loading}
                Discord ile Giriş Yapılıyor...
            {:else}
                Discord ile Giriş Yap
            {/if}
        </button>
        <p>Zaten hesabınız var mı? <a href="/auth/login">Giriş yapın</a></p>
    </div>
</div>

<style>
    .container {
        max-width: 400px;
        margin: 2rem auto;
        padding: 0 1rem;
    }

    .auth-form {
        background: #fff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    h2 {
        text-align: center;
        margin-bottom: 2rem;
    }

    .form-group {
        margin-bottom: 1rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
    }

    input {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    button {
        width: 100%;
        padding: 0.75rem;
        background: #4a90e2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-top: 1rem;
    }

    button:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    button:not(:disabled):hover {
        background: #357abd;
    }

    .error {
        color: red;
        margin-bottom: 1rem;
        text-align: center;
        padding: 0.5rem;
        background: #fff0f0;
        border-radius: 4px;
    }

    p {
        text-align: center;
        margin-top: 1rem;
    }

    a {
        color: #4a90e2;
        text-decoration: none;
    }

    a:hover {
        text-decoration: underline;
    }

    .discord-button {
        width: 100%;
        padding: 0.75rem;
        background: #5865F2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        font-size: 1rem;
        transition: background-color 0.2s;
    }

    .discord-button:hover:not(:disabled) {
        background: #4752C4;
    }

    .discord-button:disabled {
        background: #99AAB5;
        cursor: not-allowed;
    }

    .discord-button img {
        width: 24px;
        height: 24px;
    }
</style> 