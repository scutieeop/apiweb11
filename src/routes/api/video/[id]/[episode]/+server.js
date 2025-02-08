import { error } from '@sveltejs/kit';
import axios from 'axios';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function getVideoSources(animeId, episode) {
    try {
        // Önce video kaynaklarını al
        const response = await axios.get(
            `https://animecix.net/secure/episode-videos?titleId=${animeId}&episode=${episode}&season=1`,
            { headers }
        );

        // Tau video kaynaklarını filtrele
        const tauVideos = response.data.filter(video => video.url.includes('tau'));
        if (!tauVideos.length) {
            throw new Error('Bu bölüm için video kaynağı bulunamadı');
        }

        // İlk tau videosunu al
        const tauVideo = tauVideos[0];
        const tauId = tauVideo.url.split('/embed/')[1];

        // Tau video detaylarını al
        const tauResponse = await axios.get(
            `https://tau-video.xyz/api/video/${tauId}`,
            { headers }
        );

        return tauResponse.data;
    } catch (err) {
        console.error('Video kaynakları alınırken hata:', err);
        throw err;
    }
}

export async function GET({ params }) {
    try {
        const { id, episode } = params;
        
        if (!id || !episode) {
            throw error(400, 'Anime ID ve bölüm numarası gerekli');
        }

        const videoData = await getVideoSources(id, episode);
        
        if (!videoData || !videoData.urls) {
            throw error(404, 'Video kaynakları bulunamadı');
        }

        return new Response(JSON.stringify(videoData), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        console.error('Video API hatası:', err);
        throw error(500, 'Video yüklenirken bir hata oluştu: ' + err.message);
    }
} 