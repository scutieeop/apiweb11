import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, params, locals }) {
    if (!locals.user) {
        throw error(401, 'Bu işlem için giriş yapmanız gerekiyor');
    }

    const db = await getDb();

    try {
        // Kullanıcının kendi profilini güncellemesini sağla
        if (locals.user.username !== params.username) {
            throw error(403, 'Sadece kendi profilinizi güncelleyebilirsiniz');
        }

        // Önce kullanıcıyı bul
        const user = await db.collection('animaxv2.users').findOne({ 
            username: params.username 
        });

        if (!user) {
            throw error(404, 'Kullanıcı bulunamadı');
        }

        // Yeni gizlilik durumu
        const newPrivacyStatus = !user.isPrivate;

        // Kullanıcı bilgilerini güncelle
        const result = await db.collection('animaxv2.users').updateOne(
            { username: params.username },
            { 
                $set: { 
                    isPrivate: newPrivacyStatus,
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            throw error(500, 'Güncelleme başarısız oldu');
        }

        // Güncellenmiş kullanıcı bilgilerini al
        const updatedUser = await db.collection('animaxv2.users').findOne({ 
            username: params.username 
        });

        if (!updatedUser) {
            throw error(404, 'Güncellenmiş kullanıcı bilgileri alınamadı');
        }

        return new Response(JSON.stringify({ 
            success: true,
            user: updatedUser,
            message: newPrivacyStatus ? 'Profiliniz gizli yapıldı' : 'Profiliniz herkese açık yapıldı'
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
    } catch (err) {
        console.error('Profil gizlilik ayarı güncellenirken hata oluştu:', err);
        
        if (err.status) {
            throw err;
        }
        
        throw error(500, 'Profil gizlilik ayarı güncellenirken bir hata oluştu');
    }
} 