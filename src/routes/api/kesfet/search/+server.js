import { error } from '@sveltejs/kit';
import axiosInstance from '$lib/server/axios-config';

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
};

async function searchAnimecix(name, filters = {}) {
    try {
        console.log('Animecix API\'sine istek gönderiliyor:', { name, filters });
        
        // Filtre parametrelerini oluştur
        const params = new URLSearchParams();
        if (filters.type && filters.type !== 'all') params.append('type', filters.type);
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.year && filters.year !== 'all') params.append('year', filters.year);
        
        // Limit parametresi
        params.append('limit', '24');
        
        // Provider parametresi (boş bırakılabilir)
        params.append('provider', '');

        const url = `https://animecix.net/secure/search/${encodeURIComponent(name)}?${params.toString()}`;
        console.log('İstek URL:', url);

        const response = await axiosInstance.get(url, { headers });
        console.log('Animecix API yanıtı:', response.data);

        // Sonuçları sırala
        let results = response.data.results || [];
        if (filters.sort) {
            results = sortResults(results, filters.sort);
        }

        // Her anime için poster URL'sini ekle
        results = results.map(anime => ({
            ...anime,
            poster: anime.poster || null
        }));

        return { ...response.data, results };
    } catch (err) {
        console.error('Animecix API hatası:', err);
        throw err;
    }
}

function sortResults(results, sortType) {
    switch (sortType) {
        case 'popularity':
            return results.sort((a, b) => b.mal_score - a.mal_score);
        case 'newest':
            return results.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        case 'oldest':
            return results.sort((a, b) => new Date(a.release_date) - new Date(b.release_date));
        case 'name':
            return results.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return results;
    }
}

export async function OPTIONS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Accept'
        }
    });
}

export async function GET({ url }) {
    try {
        const query = url.searchParams.get('q');
        if (!query) {
            throw error(400, 'Arama sorgusu gerekli');
        }

        // Filtreleri al
        const filters = {
            type: url.searchParams.get('type') || 'all',
            status: url.searchParams.get('status') || 'all',
            year: url.searchParams.get('year') || 'all',
            sort: url.searchParams.get('sort') || 'popularity'
        };

        console.log('Arama başlatılıyor:', { query, filters });
        const animeList = await searchAnimecix(query, filters);

        if (!animeList.results?.length) {
            console.log('Sonuç bulunamadı');
            return new Response(JSON.stringify({ results: [] }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        console.log('İşlenmiş sonuçlar:', animeList.results);

        return new Response(JSON.stringify({ results: animeList.results }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        console.error('Arama hatası:', err);
        
        // API hata detaylarını kontrol et
        if (err.response) {
            console.error('API hata detayları:', {
                status: err.response.status,
                data: err.response.data
            });
        }

        throw error(500, 'Anime aranırken bir hata oluştu: ' + (err.message || 'Bilinmeyen hata'));
    }
} 