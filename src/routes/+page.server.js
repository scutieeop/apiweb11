import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ANIME_DATA_FILE = join('data', 'animeler.json');
const BASE_URL = process.env.NODE_ENV === 'production' ? 'https://animax.net.tr' : 'http://localhost:3000';

function getRandomAnimes(count) {
    try {
        // JSON dosyasının varlığını kontrol et
        if (!existsSync(ANIME_DATA_FILE)) {
            console.error('Anime verileri bulunamadı:', ANIME_DATA_FILE);
            return [];
        }

        // JSON dosyasını oku
        const data = readFileSync(ANIME_DATA_FILE, 'utf8');
        const animes = JSON.parse(data);
        
        // Object.entries ile key-value çiftlerini diziye çevir ve URL'leri ekle
        const animeList = Object.entries(animes).map(([key, value]) => {
            // Bölümleri sezonlara göre grupla
            const seasons = value.bolumler.reduce((acc, bolum) => {
                const season = bolum.season || 1;
                if (!acc[season]) {
                    acc[season] = [];
                }
                acc[season].push(bolum);
                return acc;
            }, {});

            // Her sezon için URL'leri oluştur
            const seasonUrls = Object.entries(seasons).reduce((acc, [season, bolumler]) => {
                if (bolumler[0]) {
                    // Direkt video URL'si yerine anime sayfası URL'si
                    acc[season] = `${BASE_URL}/anime/${key}/sezon-${season}/bolum-1`;
                }
                return acc;
            }, {});

            // Logo URL'sini kontrol et ve düzelt
            let logoUrl = value.logoUrl;
            if (logoUrl && !logoUrl.startsWith('http')) {
                logoUrl = `${BASE_URL}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}`;
            }

            // Bölüm URL'lerini güvenli hale getir
            const secureEpisodes = value.bolumler.map(bolum => ({
                ...bolum,
                // Video URL'lerini blob URL'lerine dönüştürmek için işaretleme
                videoUrls: bolum.videoUrls.map(url => ({
                    original: url,
                    secure: true // Bu, frontend'de blob URL'sine dönüştürülecek
                }))
            }));

            return {
                id: key,
                name: value.name,
                logoUrl: logoUrl || `${BASE_URL}/placeholder.jpg`,
                bolumler: secureEpisodes,
                seasonUrls, // Sezon URL'leri
                watchUrl: `${BASE_URL}/anime/${key}/bolum-1`, // Ana izleme URL'si
                totalSeasons: Object.keys(seasons).length,
                totalEpisodes: value.bolumler.length
            };
        });

        // Diziyi karıştır (Fisher-Yates algoritması)
        for (let i = animeList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [animeList[i], animeList[j]] = [animeList[j], animeList[i]];
        }

        // İstenen sayıda anime döndür
        return animeList.slice(0, Math.min(count, animeList.length));
    } catch (err) {
        console.error('Anime verileri okunurken hata:', err);
        return [];
    }
}

export function load() {
    const recommendedAnimes = getRandomAnimes(5);
    return {
        recommendedAnimes
    };
} 