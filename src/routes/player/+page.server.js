import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
    try {
        const videoId = url.searchParams.get('id');
        const db = await getDb();

        // Eğer video ID belirtilmemişse, tüm videoları getir
        if (!videoId) {
            const videos = await db.collection('videos')
                .find({})
                .sort({ createdAt: -1 })
                .toArray();

            return {
                videos: videos.map(video => ({
                    ...video,
                    _id: video._id.toString()
                }))
            };
        }

        // Belirli bir video için detayları getir
        const video = await db.collection('videos').findOne({ _id: videoId });
        
        if (!video) {
            throw error(404, 'Video bulunamadı');
        }

        return {
            video: {
                ...video,
                _id: video._id.toString()
            }
        };
    } catch (err) {
        console.error('Video yüklenirken hata:', err);
        throw error(500, 'Video yüklenirken bir hata oluştu');
    }
}

/** @type {import('./$types').Actions} */
export const actions = {
    updateProgress: async ({ request }) => {
        const data = await request.formData();
        const videoId = data.get('videoId');
        const currentTime = data.get('currentTime');

        if (!videoId || !currentTime) {
            throw error(400, 'Geçersiz istek');
        }

        try {
            const db = await getDb();
            await db.collection('videoProgress').updateOne(
                { videoId },
                {
                    $set: {
                        currentTime: parseFloat(currentTime),
                        updatedAt: new Date()
                    }
                },
                { upsert: true }
            );

            return { success: true };
        } catch (err) {
            console.error('İlerleme kaydedilirken hata:', err);
            throw error(500, 'İlerleme kaydedilirken bir hata oluştu');
        }
    }
}; 