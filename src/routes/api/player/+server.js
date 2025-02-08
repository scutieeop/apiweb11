import { error } from '@sveltejs/kit';

export async function OPTIONS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}

export async function GET({ url }) {
    try {
        const videoId = url.searchParams.get('id');
        
        // Örnek video verisi - gerçek uygulamada veritabanından gelecek
        const videos = {
            '1': {
                id: '1',
                title: 'Örnek Video 1',
                url: 'https://example.com/video1.mp4',
                thumbnail: 'https://example.com/thumb1.jpg',
            }
        };

        if (!videoId) {
            return new Response(JSON.stringify({ videos: Object.values(videos) }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        const video = videos[videoId];
        if (!video) {
            throw error(404, 'Video bulunamadı');
        }

        return new Response(JSON.stringify(video), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        throw error(500, 'Video yüklenirken bir hata oluştu');
    }
}

export async function POST({ request }) {
    try {
        const data = await request.json();
        // Video yükleme, güncelleme işlemleri burada yapılacak
        
        return new Response(JSON.stringify({ success: true }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        throw error(500, 'Video işlenirken bir hata oluştu');
    }
} 