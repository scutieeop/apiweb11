import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import { MongoClient } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    try {
        console.log('Fansub verileri yükleniyor...');
        const db = await getDb();
        console.log('MongoDB bağlantısı başarılı');

        // Fansubları getir
        const fansubs = await db.collection('fansubs').find({}).toArray();
        console.log('Bulunan fansub sayısı:', fansubs.length);
        console.log('Fansub verileri:', JSON.stringify(fansubs, null, 2));

        if (!fansubs || fansubs.length === 0) {
            console.log('Hiç fansub bulunamadı');
            return {
                fansubs: [],
                success: true
            };
        }

        const mappedFansubs = fansubs.map(fansub => ({
            _id: fansub._id.toString(),
            name: fansub.name,
            description: fansub.description || '',
            logo: fansub.logo || '',
            members: fansub.members || [],
            status: fansub.status || 'active'
        }));

        console.log('İşlenmiş fansub verileri:', JSON.stringify(mappedFansubs, null, 2));

        return {
            fansubs: mappedFansubs,
            success: true
        };
    } catch (err) {
        console.error('Fansub verilerini getirme hatası:', err);
        throw error(500, {
            message: 'Fansub verilerini getirirken bir hata oluştu',
            error: err.message
        });
    }
}

/** @type {import('./$types').Actions} */
export const actions = {
    join: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Bu işlem için giriş yapmanız gerekiyor');
        }

        const formData = await request.formData();
        const fansubId = formData.get('fansubId');

        if (!fansubId) {
            throw error(400, 'Fansub ID\'si gerekli');
        }

        try {
            const db = await getDb();
            
            // Fansub'ı kontrol et
            const fansub = await db.collection('fansubs').findOne({
                _id: new ObjectId(fansubId),
                status: 'active'
            });

            if (!fansub) {
                throw error(404, 'Fansub bulunamadı');
            }

            // Kullanıcı zaten üye mi kontrol et
            if (fansub.members?.includes(locals.user.discordId)) {
                throw error(400, 'Bu fansuba zaten üyesiniz');
            }

            // Üye olarak ekle
            await db.collection('fansubs').updateOne(
                { _id: new ObjectId(fansubId) },
                { $addToSet: { members: locals.user.discordId } }
            );

            return {
                success: true,
                message: 'Fansuba başarıyla katıldınız'
            };
        } catch (err) {
            console.error('Fansuba katılırken hata oluştu:', err);
            throw error(500, 'Fansuba katılırken bir hata oluştu');
        }
    },

    leave: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Bu işlem için giriş yapmanız gerekiyor');
        }

        const formData = await request.formData();
        const fansubId = formData.get('fansubId');

        if (!fansubId) {
            throw error(400, 'Fansub ID\'si gerekli');
        }

        try {
            const db = await getDb();
            
            // Fansub'ı kontrol et
            const fansub = await db.collection('fansubs').findOne({
                _id: new ObjectId(fansubId)
            });

            if (!fansub) {
                throw error(404, 'Fansub bulunamadı');
            }

            // Kullanıcı fansub'ın sahibi mi kontrol et
            if (fansub.createdBy === locals.user.discordId) {
                throw error(400, 'Fansub sahibi olarak ayrılamazsınız');
            }

            // Üyelikten çıkar
            await db.collection('fansubs').updateOne(
                { _id: new ObjectId(fansubId) },
                { $pull: { members: locals.user.discordId } }
            );

            return {
                success: true,
                message: 'Fansubdan başarıyla ayrıldınız'
            };
        } catch (err) {
            console.error('Fansubdan ayrılırken hata oluştu:', err);
            throw error(500, 'Fansubdan ayrılırken bir hata oluştu');
        }
    }
}; 