import { redirect } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** @type {import('@sveltejs/kit').RequestHandler} */
export const GET = async ({ url, cookies }) => {
    const sessionId = cookies.get('session');
    
    if (!sessionId) {
        throw redirect(303, '/auth/register');
    }

    try {
        const db = await getDb();
        const session = await db.collection('animaxv2.sessions').findOne({ id: sessionId });

        if (!session) {
            cookies.delete('session', { path: '/' });
            throw redirect(303, '/auth/register');
        }

        // Session süresi dolmuş mu kontrol et
        if (new Date() > new Date(session.expiresAt)) {
            await db.collection('animaxv2.sessions').deleteOne({ id: sessionId });
            cookies.delete('session', { path: '/' });
            throw redirect(303, '/auth/register');
        }

        return new Response(null, { 
            status: 303, 
            headers: { Location: `/profile/${session.username}` } 
        });
    } catch (error) {
        console.error('Session kontrol hatası:', error);
        cookies.delete('session', { path: '/' });
        throw redirect(303, '/auth/register');
    }
}; 