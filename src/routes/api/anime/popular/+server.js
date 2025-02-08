import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export async function GET() {
    try {
        const db = await getDb();
        
        // En son eklenen 12 animeyi getir
        const popularAnimes = await db.collection('animeler')
            .find({})
            .sort({ createdAt: -1 })
            .limit(12)
            .toArray();

        return new Response(JSON.stringify(popularAnimes), {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error('Popüler animeler yüklenirken hata:', err);
        throw error(500, err.message);
    }
} 