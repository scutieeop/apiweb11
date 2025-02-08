import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

export async function POST({ request }) {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db('animeDB');
        const fansubCollection = db.collection('animaxv2.fansubs');

        // Örnek fansub verisi
        const fansub = {
            name: "Tau Fansub",
            description: "Türkiye'nin en büyük anime çeviri grubu",
            logo: "https://cdn.discordapp.com/attachments/123456789/123456789/logo.png",
            createdBy: "123456789",
            members: ["123456789"],
            status: "active",
            animeCount: 100,
            mangaCount: 50,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await fansubCollection.insertOne(fansub);
        await client.close();

        return json({
            success: true,
            message: 'Fansub başarıyla eklendi'
        });
    } catch (error) {
        console.error('Fansub ekleme hatası:', error);
        return json({
            success: false,
            error: 'Fansub eklenirken bir hata oluştu'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db('animeDB');
        const fansubCollection = db.collection('animaxv2.fansubs');

        const fansubs = await fansubCollection.find({
            status: 'active'
        }).project({
            name: 1,
            description: 1,
            logo: 1,
            animeCount: 1,
            mangaCount: 1,
            createdAt: 1
        }).toArray();

        await client.close();

        return json({
            success: true,
            fansubs: fansubs
        });
    } catch (error) {
        console.error('Fansub verilerini getirme hatası:', error);
        return json({
            success: false,
            error: 'Fansub verileri alınamadı'
        }, { status: 500 });
    }
} 