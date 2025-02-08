import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
    if (!locals.user || !['founder', 'admin'].includes(locals.user.role)) {
        throw error(403, 'Bu sayfaya erişim yetkiniz yok');
    }

    try {
        const db = await getDb();
        const users = await db.collection('animaxv2')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return {
            users: users.map(user => ({
                ...user,
                _id: user._id.toString()
            }))
        };
    } catch (err) {
        console.error('Kullanıcılar yüklenirken hata oluştu:', err);
        throw error(500, 'Kullanıcılar yüklenirken bir hata oluştu');
    }
}

/** @type {import('./$types').Actions} */
export const actions = {
    ban: async ({ request, locals }) => {
        console.log('Ban işlemi başlatıldı');
        
        if (!locals.user || locals.user.role !== 'founder') {
            console.error('Yetkisiz erişim denemesi:', locals.user);
            throw error(403, 'Bu işlemi gerçekleştirme yetkiniz yok');
        }

        const formData = await request.formData();
        const userId = formData.get('userId');
        console.log('Yasaklanacak kullanıcı ID:', userId);

        if (!userId) {
            console.error('Kullanıcı ID\'si eksik');
            throw error(400, 'Kullanıcı ID\'si gerekli');
        }

        try {
            console.log('Veritabanı işlemleri başlatılıyor...');
            const db = await getDb();
            
            // Kullanıcıyı banned olarak işaretle
            console.log('Kullanıcı yasaklama işlemi başlatıldı');
            const userResult = await db.collection('animaxv2').updateOne(
                { discordId: userId },
                { 
                    $set: { 
                        isBanned: true,
                        banReason: 'Dashboard üzerinden yasaklandı',
                        bannedAt: new Date(),
                        bannedBy: locals.user.discordId
                    }
                }
            );
            console.log('Kullanıcı güncelleme sonucu:', userResult);

            // Bans koleksiyonuna ekle
            console.log('Bans koleksiyonuna ekleniyor...');
            const banResult = await db.collection('bans').insertOne({
                discordId: userId,
                reason: 'Dashboard üzerinden yasaklandı',
                bannedBy: locals.user.discordId,
                bannedAt: new Date()
            });
            console.log('Ban kaydı sonucu:', banResult);

            if (userResult.matchedCount === 0) {
                console.error('Kullanıcı bulunamadı:', userId);
                throw error(404, 'Kullanıcı bulunamadı');
            }

            console.log('Ban işlemi başarıyla tamamlandı');
            return { success: true };
        } catch (err) {
            console.error('Ban işlemi sırasında hata:', {
                error: err,
                userId,
                admin: locals.user.discordId
            });
            throw error(500, 'Kullanıcı yasaklanırken bir hata oluştu: ' + err.message);
        }
    },

    unban: async ({ request, locals }) => {
        console.log('Unban işlemi başlatıldı');
        
        if (!locals.user || locals.user.role !== 'founder') {
            console.error('Yetkisiz unban denemesi:', locals.user);
            throw error(403, 'Bu işlemi gerçekleştirme yetkiniz yok');
        }

        const formData = await request.formData();
        const userId = formData.get('userId');
        console.log('Yasağı kaldırılacak kullanıcı ID:', userId);

        if (!userId) {
            console.error('Kullanıcı ID\'si eksik');
            throw error(400, 'Kullanıcı ID\'si gerekli');
        }

        try {
            console.log('Veritabanı işlemleri başlatılıyor...');
            const db = await getDb();
            
            // Kullanıcının ban durumunu kaldır
            console.log('Kullanıcı yasağı kaldırma işlemi başlatıldı');
            const userResult = await db.collection('animaxv2').updateOne(
                { discordId: userId },
                { 
                    $unset: { 
                        isBanned: "",
                        banReason: "",
                        bannedAt: "",
                        bannedBy: ""
                    }
                }
            );
            console.log('Kullanıcı güncelleme sonucu:', userResult);

            // Bans koleksiyonundan kaldır
            console.log('Bans koleksiyonundan siliniyor...');
            const banResult = await db.collection('bans').deleteOne({ discordId: userId });
            console.log('Ban kaydı silme sonucu:', banResult);

            if (userResult.matchedCount === 0) {
                console.error('Kullanıcı bulunamadı:', userId);
                throw error(404, 'Kullanıcı bulunamadı');
            }

            console.log('Unban işlemi başarıyla tamamlandı');
            return { success: true };
        } catch (err) {
            console.error('Unban işlemi sırasında hata:', {
                error: err,
                userId,
                admin: locals.user.discordId
            });
            throw error(500, 'Kullanıcı yasağı kaldırılırken bir hata oluştu: ' + err.message);
        }
    }
}; 