import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

let db = null;
let client = null;

export async function getDb() {
    if (db) return db;

    try {
        // Eğer önceki bağlantı varsa kapat
        if (client) {
            await client.close();
            client = null;
            db = null;
        }

        client = await MongoClient.connect(MONGODB_URI);
        db = client.db('animeDB');

        // Koleksiyonları kontrol et ve oluştur
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);

        // animeler koleksiyonunu oluştur
        if (!collectionNames.includes('animeler')) {
            await db.createCollection('animeler', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['name', 'createdAt', 'updatedAt'],
                        properties: {
                            name: { bsonType: 'string' },
                            description: { bsonType: 'string' },
                            coverImage: { bsonType: 'string' },
                            type: { bsonType: 'string' },
                            year: { bsonType: 'int' },
                            status: { bsonType: 'string' },
                            genres: { 
                                bsonType: 'array',
                                items: { bsonType: 'string' }
                            },
                            episodes: { 
                                bsonType: 'array',
                                items: {
                                    bsonType: 'object',
                                    required: ['episode', 'season', 'title'],
                                    properties: {
                                        episode: { bsonType: 'int' },
                                        season: { bsonType: 'int' },
                                        title: { bsonType: 'string' }
                                    }
                                }
                            },
                            seasonCount: { bsonType: 'int' },
                            episodeCount: { bsonType: 'int' },
                            createdAt: { bsonType: 'date' },
                            updatedAt: { bsonType: 'date' }
                        }
                    }
                }
            });
        }

        // bolumler koleksiyonunu oluştur
        if (!collectionNames.includes('bolumler')) {
            await db.createCollection('bolumler', {
                validator: {
                    $jsonSchema: {
                        bsonType: 'object',
                        required: ['animeId', 'episode', 'season', 'title', 'videos', 'createdAt', 'updatedAt'],
                        properties: {
                            animeId: { bsonType: 'objectId' },
                            episode: { bsonType: 'int' },
                            season: { bsonType: 'int' },
                            title: { bsonType: 'string' },
                            description: { bsonType: 'string' },
                            thumbnail: { bsonType: 'string' },
                            videos: {
                                bsonType: 'array',
                                items: {
                                    bsonType: 'object',
                                    required: ['url', 'type', 'fansub'],
                                    properties: {
                                        url: { bsonType: 'string' },
                                        type: { bsonType: 'string' },
                                        quality: { bsonType: 'string' },
                                        provider: { bsonType: 'string' },
                                        name: { bsonType: 'string' },
                                        fansub: { bsonType: 'string' },
                                        language: { bsonType: 'string' }
                                    }
                                }
                            },
                            createdAt: { bsonType: 'date' },
                            updatedAt: { bsonType: 'date' }
                        }
                    }
                }
            });
        }

        return db;
    } catch (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err);
        throw new Error('Veritabanı bağlantısı başarısız');
    }
}

export async function closeDb() {
    if (client) {
        await client.close();
        client = null;
        db = null;
        console.log('MongoDB bağlantısı kapatıldı');
    }
}
