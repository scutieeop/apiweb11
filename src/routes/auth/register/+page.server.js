import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

/** @type {import('@sveltejs/kit').PageServerLoad} */
export const load = async ({ cookies }) => {
    const sessionData = cookies.get('session');
    const session = sessionData ? JSON.parse(sessionData) : null;

    if (session) {
        throw redirect(303, `/profile/${session.username}`);
    }

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${
        env.DISCORD_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
        env.DISCORD_REDIRECT_URI
    )}&response_type=code&scope=identify`;

    return {
        discordAuthUrl
    };
}; 