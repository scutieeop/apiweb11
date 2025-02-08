import { MongoClient, Db } from 'mongodb';
import { env } from '$env/dynamic/private';

let client: MongoClient | null = null;

async function connectDB(): Promise<MongoClient> {
    if (!client) {
        client = new MongoClient(env.MONGODB_URI);
        await client.connect();
        console.log('MongoDB bağlantısı başarıyla kuruldu');
    }
    return client;
}

export default connectDB;

export function getDb(): Db {
    if (!client) {
        throw new Error('Veritabanı bağlantısı henüz kurulmadı');
    }
    return client.db();
}

export async function closeDB(): Promise<void> {
    if (client) {
        await client.close();
        console.log('MongoDB bağlantısı kapatıldı');
    }
} 