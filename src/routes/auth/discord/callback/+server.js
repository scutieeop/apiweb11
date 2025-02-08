import { redirect } from '@sveltejs/kit';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET } from '$env/static/private';
import { getDb } from '$lib/server/db';
import { randomBytes } from 'crypto';

const DISCORD_ROLES = {
    '1333085642367701033': 'founder',
    '1333085716573589546': 'admin',
    '1334106634720641086': 'developer',
    '1333085774773616661': 'guide',
    '1333085774991855699': 'contributor'
};

// Özel kurucular
const SPECIAL_FOUNDERS = ['1112945015132536943', '1246506868977696811', '1245436966972031069'];

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function GET({ url, cookies, fetch }) {
    const code = url.searchParams.get('code');
    if (!code) {
        console.error('Auth kodu bulunamadı');
        throw redirect(303, '/');
    }

    try {
        if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
            console.error('Discord yapılandırma değerleri eksik:', {
                clientId: DISCORD_CLIENT_ID ? 'mevcut' : 'eksik',
                clientSecret: DISCORD_CLIENT_SECRET ? 'mevcut' : 'eksik'
            });
            throw new Error('Sunucu taraflı hata');
        }

        const tokenRequestBody = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID.toString(),
            client_secret: DISCORD_CLIENT_SECRET,
            grant_type: 'authorization_code',
            code,
            redirect_uri: 'http://localhost:3000/auth/discord/callback'
        });

        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: tokenRequestBody,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Token alınamadı:', tokenData);
            throw redirect(303, '/');
        }

        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            console.error('Kullanıcı bilgileri alınamadı:', userData);
            throw redirect(303, '/');
        }

        // Discord sunucusundaki rolleri al
        const guildResponse = await fetch(`https://discord.com/api/users/@me/guilds/1333085582586548224/member`, {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`
            }
        });

        const guildData = await guildResponse.json();
        
        // Kullanıcının rolünü belirle
        let userRole = 'user';
        
        // Özel kurucu kontrolü
        if (SPECIAL_FOUNDERS.includes(userData.id)) {
            userRole = 'founder';
        }
        // Discord sunucusundaki rol kontrolü
        else if (guildResponse.ok && guildData.roles) {
            for (const roleId of guildData.roles) {
                if (DISCORD_ROLES[roleId]) {
                    userRole = DISCORD_ROLES[roleId];
                    break;
                }
            }
        }

        // Session oluştur
        const sessionId = randomBytes(32).toString('hex');
        const db = await getDb();

        // Kullanıcıyı veritabanına kaydet veya güncelle
        const userDoc = {
            discordId: userData.id,
            username: userData.username,
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
            email: userData.email,
            role: userRole,
            isPrivate: false,
            createdAt: new Date(),
            lastLogin: new Date()
        };

        try {
            await db.collection('animaxv2.users').updateOne(
                { discordId: userData.id },
                { $set: userDoc },
                { upsert: true }
            );

            // Session'ı veritabanına kaydet
            const sessionDoc = {
                id: sessionId,
                userId: userData.id,
                username: userData.username,
                avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
                role: userRole,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün
            };

            await db.collection('animaxv2.sessions').insertOne(sessionDoc);

            // Session cookie'sini ayarla
            cookies.set('session', sessionId, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 // 30 gün
            });

            return new Response(null, {
                status: 303,
                headers: { Location: `/profile/${userData.username}` }
            });

        } catch (error) {
            console.error('Veritabanı işlem hatası:', error);
            throw redirect(303, '/');
        }

    } catch (error) {
        if (error instanceof Response) throw error;
        console.error('Auth hatası:', error);
        throw redirect(303, '/');
    }
}
