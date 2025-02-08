import { error, redirect } from '@sveltejs/kit';
import { config } from '$lib/config';

export async function GET() {
    if (!config.DISCORD_LOGIN_ENABLED) {
        throw error(403, {
            message: config.DISCORD_ACCESS_MESSAGE
        });
    }

    // Discord OAuth URL'sine yönlendir
    throw redirect(302, '/auth/discord/login');
} 