import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import axiosInstance from '$lib/server/axios-config';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function getVideoURLs(animeId, season, episode) {
    const response = await axiosInstance.get(
        `https://animecix.net/secure/episode-videos?titleId=${animeId}&episode=${episode}&season=${season}`,
        { headers }
    );
    return response.data.filter(video => video.url.includes('tau'));
}

async function getTauVideo(id) {
    try {
        const url = `https://tau-video.xyz/api/video/${id}`;
        const response = await axiosInstance.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error('Tau video hatası:', error);
        return null;
    }
}

export async function POST({ request }) {
    try {
        const { animeId } = await request.json();
        if (!animeId) {
            throw error(400, 'Anime ID gerekli');
        }

        const db = await getDb();

        // Anime detaylarını al
        const animeResponse = await axiosInstance.get(
            `https://animecix.net/secure/title/${animeId}`,
            { headers }
        );
        const animeData = animeResponse.data;

        // Poster ve backdrop URL'lerini ekle
        const posterUrl = animeData.id ? `https://cdn.animecix.net/poster/${animeId}.jpg` : null;
        const backdropUrl = animeData.backdrop || null;

        // Tüm bölümleri topla
        const episodes = [];
        for (let season = 1; season <= animeData.season_count; season++) {
            for (let episode = 1; episode <= animeData.episode_count; episode++) {
                console.log(`${animeData.name} - Sezon ${season} Bölüm ${episode} işleniyor...`);
                
                const videos = await getVideoURLs(animeId, season, episode);
                if (videos && videos.length > 0) {
                    // Her video için tau video detaylarını al
                    for (const video of videos) {
                        const tauId = video.url.split('/embed/')[1];
                        if (tauId) {
                            const tauVideo = await getTauVideo(tauId);
                            if (tauVideo && tauVideo.urls) {
                                episodes.push({
                                    season,
                                    episode,
                                    fansub: video.extra || 'Bilinmiyor',
                                    videoUrls: tauVideo.urls,
                                    tauId
                                });
                            }
                        }
                    }
                }
            }
        }

        // Anime verisini MongoDB'ye kaydet
        await db.collection('animaxv2.animeler').updateOne(
            { animeId: animeId.toString() },
            {
                $set: {
                    ...animeData,
                    poster: posterUrl,
                    backdrop: backdropUrl,
                    episodes,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        return new Response(JSON.stringify({ 
            success: true,
            message: `${animeData.name} başarıyla kaydedildi. Toplam ${episodes.length} bölüm bulundu.`
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        console.error('Anime kaydetme hatası:', err);
        throw error(500, 'Anime kaydedilirken bir hata oluştu: ' + err.message);
    }
} 