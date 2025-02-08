import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    try {
        const db = await getDb();
        const users = await db.collection('animaxv2.users')
            .find({})
            .project({ 
                username: 1, 
                discordId: 1, 
                avatar: 1, 
                role: 1,
                isPrivate: 1
            })
            .toArray();

        return new Response(JSON.stringify(users), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (err) {
        console.error('Kullanıcılar getirilirken hata oluştu:', err);
        throw error(500, 'Kullanıcılar getirilirken bir hata oluştu');
    }
} 