import { getDb } from '$lib/server/db';
import { handleCors } from '$lib/server/cors';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const session = event.cookies.get('session');

    if (session) {
        try {
            const db = await getDb();
            const sessionData = await db.collection('animaxv2.sessions').findOne({ id: session });

            if (sessionData && new Date() < new Date(sessionData.expiresAt)) {
                // Session geçerli, kullanıcı bilgilerini al
                const userData = await db.collection('animaxv2.users').findOne({ discordId: sessionData.userId });
                
                if (userData) {
                    event.locals.user = {
                        userId: userData.discordId,
                        username: userData.username,
                        avatar: userData.avatar,
                        role: userData.role,
                        isPrivate: userData.isPrivate
                    };
                } else {
                    // Kullanıcı bulunamadı, session'ı temizle
                    event.cookies.delete('session', { path: '/' });
                    await db.collection('animaxv2.sessions').deleteOne({ id: session });
                }
            } else if (sessionData) {
                // Session süresi dolmuş, temizle
                event.cookies.delete('session', { path: '/' });
                await db.collection('animaxv2.sessions').deleteOne({ id: session });
            }
        } catch (error) {
            console.error('Session error:', error);
            // Hata durumunda session'ı temizle
            event.cookies.delete('session', { path: '/' });
        }
    }

    // API istekleri için CORS uygula
    if (event.url.pathname.startsWith('/api')) {
        return handleCors({
            request: event.request,
            resolve: () => resolve(event)
        });
    }

    // API dışı istekler için normal işleme devam et
    const response = await resolve(event);
    return response;
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }) {
    console.error('Server error:', error);
    return {
        message: 'Bir hata oluştu',
        code: error?.code ?? 'UNKNOWN'
    };
} 