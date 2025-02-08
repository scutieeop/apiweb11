import { error } from '@sveltejs/kit';
import { corsHeaders } from '$lib/server/cors';

export async function GET({ url, request }) {
    try {
        const videoUrl = url.searchParams.get('url');
        if (!videoUrl) {
            throw error(400, 'Video URL\'si gerekli');
        }

        // Video içeriğini al
        const response = await fetch(videoUrl);
        if (!response.ok) {
            throw error(response.status, 'Video yüklenemedi');
        }

        // Stream olarak gönder
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
        
        // CORS header'larını ekle
        const origin = request.headers.get('origin');
        Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
            headers.set(key, value);
        });

        // Cache kontrolü
        headers.set('Cache-Control', 'public, max-age=31536000'); // 1 yıl
        
        return new Response(response.body, {
            status: 200,
            headers
        });
    } catch (err) {
        console.error('Video yükleme hatası:', err);
        throw error(500, err.message);
    }
} 