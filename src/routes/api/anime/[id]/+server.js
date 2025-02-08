import { error } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { ObjectId } from 'mongodb';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// API için gerekli ayarlar
const API_BASE_URL = 'https://animecix.net';
const ANIME_LIST_FILE = join('data', 'animelerliste.json');

// Anime listesini yükle veya oluştur
function loadAnimeList() {
    try {
        if (existsSync(ANIME_LIST_FILE)) {
            const data = readFileSync(ANIME_LIST_FILE, 'utf8');
            return JSON.parse(data);
        }
        return {};
    } catch (err) {
        console.error('Anime listesi yüklenirken hata:', err);
        return {};
    }
}

// Anime listesini kaydet
function saveAnimeList(animeList) {
    try {
        writeFileSync(ANIME_LIST_FILE, JSON.stringify(animeList, null, 2), 'utf8');
    } catch (err) {
        console.error('Anime listesi kaydedilirken hata:', err);
    }
}

// Anime detaylarını al
async function getAnimeDetails(titleId) {
    try {
        console.log('Anime detayları isteniyor:', titleId);
        
        const response = await fetch(`${API_BASE_URL}/secure/titles/${titleId}?titleId=${titleId}`);

        if (!response.ok) {
            console.error('Anime detayları alınamadı:', await response.text());
            throw error(404, 'Anime bulunamadı');
        }

        const data = await response.json();
        console.log('Anime detayları alındı:', data);

        // Anime verilerini hazırla
        const animeData = {
            name: data.name || data.title || '',
            logoUrl: data.coverImage || data.poster || '',
            bolumler: []
        };

        // Bölüm verilerini hazırla
        if (data.episodes && Array.isArray(data.episodes)) {
            animeData.bolumler = data.episodes.map(episode => ({
                episode: episode.episode || 1,
                season: episode.season || 1,
                title: episode.title || `Bölüm ${episode.episode}`
            }));
        }

        // Anime listesini yükle ve güncelle
        const animeList = loadAnimeList();
        animeList[titleId] = animeData;
        saveAnimeList(animeList);

        return animeData;
    } catch (err) {
        console.error('Anime detayları alınırken hata:', err);
        throw err;
    }
}

export async function GET({ params }) {
    try {
        const { id } = params;
        console.log('Anime detayları isteniyor:', { id });

        if (!id) {
            throw error(400, 'Anime ID gerekli');
        }

        // Önce yerel dosyadan kontrol et
        const animeList = loadAnimeList();
        if (animeList[id]) {
            return new Response(JSON.stringify(animeList[id]), {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        // Yerel dosyada yoksa API'den çek
        const animeData = await getAnimeDetails(id);

        return new Response(JSON.stringify(animeData), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (err) {
        console.error('Anime detayları yüklenirken hata:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Bir hata oluştu'
        }), {
            status: err.status || 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

// OPTIONS isteğini işle
export function OPTIONS() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
} 