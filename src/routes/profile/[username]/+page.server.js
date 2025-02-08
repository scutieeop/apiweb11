import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/**
 * @typedef {Object} Profile
 * @property {any} [_id]
 * @property {string} username
 * @property {string} [avatar]
 * @property {boolean} isPrivate
 * @property {string} [bio]
 * @property {string} discordId
 */

/** @type {import('@sveltejs/kit').PageServerLoad} */
export async function load({ params, locals }) {
    try {
        const db = await getDb();
        
        // Profili bul
        const profile = await db.collection('animaxv2.users').findOne({ 
            username: params.username 
        });

        if (!profile) {
            throw error(404, 'Profil bulunamadı');
        }

        // Profil gizli ve kullanıcı profil sahibi değilse
        const currentUser = locals.user;
        if (profile.isPrivate && (!currentUser || currentUser.userId !== profile.discordId)) {
            return {
                profile: {
                    username: profile.username,
                    avatar: null,
                    isPrivate: true,
                    bio: "Bu profil gizli"
                },
                isOwner: false
            };
        }

        // Normal profil görüntüleme
        return {
            profile: {
                username: profile.username,
                avatar: profile.avatar,
                isPrivate: profile.isPrivate || false,
                bio: profile.bio || '',
                role: profile.role || 'user',
                createdAt: profile.createdAt
            },
            isOwner: currentUser?.userId === profile.discordId
        };
    } catch (err) {
        console.error('Profil yükleme hatası:', err);
        throw error(500, 'Profil yüklenirken bir hata oluştu');
    }
} 