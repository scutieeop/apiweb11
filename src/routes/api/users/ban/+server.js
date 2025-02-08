import { json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

export async function POST({ request, cookies }) {
    const sessionData = cookies.get('session');
    if (!sessionData) {
        return new Response('Unauthorized', { status: 401 });
    }

    const session = JSON.parse(sessionData);
    if (!['admin', 'founder'].includes(session.role)) {
        return new Response('Forbidden', { status: 403 });
    }

    try {
        const { discordId, ipAddress, reason } = await request.json();
        const db = getDb();

        await db.collection('bans').insertOne({
            discordId,
            ipAddress,
            reason,
            bannedBy: session.userId,
            bannedAt: new Date()
        });

        // Kullanıcıyı banned olarak işaretle
        await db.collection('animaxv2').updateOne(
            { discordId },
            { $set: { isBanned: true, banReason: reason } }
        );

        return json({ message: 'Kullanıcı başarıyla banlandı' });
    } catch (error) {
        console.error('Ban hatası:', error);
        return json({ message: 'Kullanıcı banlanırken bir hata oluştu' }, { status: 500 });
    }
}

export async function DELETE({ request, cookies }) {
    const sessionData = cookies.get('session');
    if (!sessionData) {
        return new Response('Unauthorized', { status: 401 });
    }

    const session = JSON.parse(sessionData);
    if (!['admin', 'founder'].includes(session.role)) {
        return new Response('Forbidden', { status: 403 });
    }

    try {
        const { discordId } = await request.json();
        const db = getDb();

        await db.collection('bans').deleteOne({ discordId });
        
        // Kullanıcının ban durumunu kaldır
        await db.collection('animaxv2').updateOne(
            { discordId },
            { $unset: { isBanned: "", banReason: "" } }
        );

        return json({ message: 'Ban başarıyla kaldırıldı' });
    } catch (error) {
        console.error('Ban kaldırma hatası:', error);
        return json({ message: 'Ban kaldırılırken bir hata oluştu' }, { status: 500 });
    }
} 