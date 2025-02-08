import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ cookies }) {
    const sessionId = cookies.get('session');

    if (sessionId) {
        try {
            const db = await getDb();
            await db.collection('animaxv2.sessions').deleteOne({ id: sessionId });
        } catch (error) {
            console.error('Session silme hatası:', error);
        }

        cookies.delete('session', { path: '/' });
    }

    throw redirect(303, '/');
} 