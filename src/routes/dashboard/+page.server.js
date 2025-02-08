import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    if (!locals.user || !['founder', 'admin'].includes(locals.user.role)) {
        throw error(403, 'Bu sayfaya erişim yetkiniz yok');
    }

    try {
        const db = await getDb();
        
        // Kullanıcıları getir
        const users = await db.collection('animaxv2.users')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        // Fansubları getir
        const fansubs = await db.collection('animaxv2.fansubs')
            .find({ status: 'active' })
            .sort({ createdAt: -1 })
            .toArray();

        // Son 24 saatte kayıt olan kullanıcı sayısı
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsers = users.filter(user => new Date(user.createdAt) > last24Hours).length;

        // Yasaklı kullanıcı sayısı
        const bannedUsers = users.filter(user => user.isBanned).length;

        // Rol dağılımı
        const roleCounts = {
            founder: users.filter(user => user.role === 'founder').length,
            admin: users.filter(user => user.role === 'admin').length,
            developer: users.filter(user => user.role === 'developer').length,
            guide: users.filter(user => user.role === 'guide').length,
            contributor: users.filter(user => user.role === 'contributor').length,
            user: users.filter(user => user.role === 'user').length
        };

        return {
            user: locals.user,
            stats: {
                totalUsers: users.length,
                newUsers,
                bannedUsers
            },
            roleCounts,
            users: users.map(user => ({
                ...user,
                _id: user._id.toString()
            })),
            fansubs: fansubs.map(fansub => ({
                ...fansub,
                _id: fansub._id.toString()
            }))
        };
    } catch (err) {
        console.error('Dashboard verileri yüklenirken hata oluştu:', err);
        throw error(500, 'Dashboard verileri yüklenirken bir hata oluştu');
    }
}

/** @type {import('./$types').Actions} */
export const actions = {
    ban: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== 'founder') {
            throw error(403, 'Bu işlemi gerçekleştirme yetkiniz yok');
        }

        const formData = await request.formData();
        const userId = formData.get('userId');
        const reason = formData.get('reason');

        if (!userId || !reason) {
            throw error(400, 'Kullanıcı ID\'si ve ban sebebi gerekli');
        }

        try {
            const db = await getDb();
            const result = await db.collection('animaxv2.users').updateOne(
                { discordId: userId },
                { 
                    $set: { 
                        isBanned: true,
                        bannedAt: new Date(),
                        bannedBy: locals.user.discordId,
                        banReason: reason
                    }
                }
            );

            if (result.matchedCount === 0) {
                throw error(404, 'Kullanıcı bulunamadı');
            }

            return { success: true };
        } catch (err) {
            console.error('Kullanıcı yasaklanırken hata oluştu:', err);
            throw error(500, 'Kullanıcı yasaklanırken bir hata oluştu');
        }
    },

    unban: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== 'founder') {
            throw error(403, 'Bu işlemi gerçekleştirme yetkiniz yok');
        }

        const formData = await request.formData();
        const userId = formData.get('userId');

        if (!userId) {
            throw error(400, 'Kullanıcı ID\'si gerekli');
        }

        try {
            const db = await getDb();
            const result = await db.collection('animaxv2.users').updateOne(
                { discordId: userId },
                { 
                    $set: { isBanned: false },
                    $unset: { bannedAt: "", bannedBy: "" }
                }
            );

            if (result.matchedCount === 0) {
                throw error(404, 'Kullanıcı bulunamadı');
            }

            return { success: true };
        } catch (err) {
            console.error('Kullanıcı yasağı kaldırılırken hata oluştu:', err);
            throw error(500, 'Kullanıcı yasağı kaldırılırken bir hata oluştu');
        }
    },

    addFansub: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Bu işlem için giriş yapmanız gerekiyor');
        }

        const formData = await request.formData();
        const name = formData.get('name')?.toString();
        const description = formData.get('description')?.toString();
        const logo = formData.get('logo')?.toString();

        if (!name) {
            throw error(400, 'Fansub adı gerekli');
        }

        try {
            const db = await getDb();

            // Yeni fansub oluştur
            const newFansub = {
                name: name.trim(),
                description: description ? description.trim() : '',
                logo: logo ? logo.trim() : ''
            };

            // MongoDB'ye ekle
            const result = await db.collection('animaxv2.fansubs').insertOne(newFansub);

            if (!result.acknowledged) {
                throw error(500, 'Fansub eklenirken bir hata oluştu');
            }

            return { success: true, message: 'Fansub başarıyla eklendi' };
        } catch (err) {
            console.error('Fansub eklenirken hata oluştu:', err);
            throw error(500, 'Fansub eklenirken bir hata oluştu');
        }
    },

    deleteFansub: async ({ request, locals }) => {
        if (!locals.user || locals.user.role !== 'founder') {
            throw error(403, 'Bu işlemi gerçekleştirme yetkiniz yok');
        }

        const formData = await request.formData();
        const fansubId = formData.get('fansubId');

        if (!fansubId) {
            throw error(400, 'Fansub ID\'si gerekli');
        }

        try {
            const db = await getDb();
            const result = await db.collection('animaxv2.fansubs').deleteOne({
                _id: new ObjectId(fansubId)
            });

            if (result.deletedCount === 0) {
                throw error(404, 'Fansub bulunamadı');
            }

            return { success: true };
        } catch (err) {
            console.error('Fansub silinirken hata oluştu:', err);
            throw error(500, 'Fansub silinirken bir hata oluştu');
        }
    }
}; 