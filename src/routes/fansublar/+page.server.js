import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    try {
        const db = await getDb();
        
        // Fansubları getir
        const fansubs = await db.collection('animaxv2.fansubs')
            .find({ status: 'active' })
            .sort({ createdAt: -1 })
            .toArray();

        // Kullanıcıları getir (fansub sahiplerinin bilgileri için)
        const users = await db.collection('animaxv2.users')
            .find({})
            .project({ username: 1, discordId: 1, avatar: 1 })
            .toArray();

        // Kullanıcı bilgilerini bir map'e dönüştür
        const userMap = new Map(users.map(user => [user.discordId, user]));

        return {
            fansubs: fansubs.map(fansub => ({
                ...fansub,
                _id: fansub._id.toString(),
                owner: userMap.get(fansub.createdBy) || null,
                memberCount: fansub.members?.length || 0,
                isUserMember: locals.user ? fansub.members?.includes(locals.user.discordId) : false
            }))
        };
    } catch (err) {
        console.error('Fansub verileri yüklenirken hata oluştu:', err);
        throw error(500, 'Fansub verileri yüklenirken bir hata oluştu');
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
            const fansub = await db.collection('animaxv2.fansubs').findOne({
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
            await db.collection('animaxv2.fansubs').updateOne(
                { _id: new ObjectId(fansubId) },
                { $addToSet: { members: locals.user.discordId } }
            );

            return { success: true };
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
            const fansub = await db.collection('animaxv2.fansubs').findOne({
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
            await db.collection('animaxv2.fansubs').updateOne(
                { _id: new ObjectId(fansubId) },
                { $pull: { members: locals.user.discordId } }
            );

            return { success: true };
        } catch (err) {
            console.error('Fansubdan ayrılırken hata oluştu:', err);
            throw error(500, 'Fansubdan ayrılırken bir hata oluştu');
        }
    }
}; 