import { error } from '@sveltejs/kit';
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

// Video kaynaklarını Animecix'ten al
async function getVideoSources(titleId, episode, season = 1) {
    try {
        // Bölüm videolarını çek
        const response = await fetch(`${API_BASE_URL}/secure/episode-videos?titleId=${titleId}&episode=${episode}&season=${season}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        
        if (!response.ok) {
            throw error(404, { message: 'Video kaynakları bulunamadı' });
        }

        const videos = await response.json();
        
        if (!Array.isArray(videos) || videos.length === 0) {
            throw error(404, { message: 'Video kaynağı bulunamadı' });
        }

        return videos;
    } catch (err) {
        console.error('Video kaynakları alınırken hata:', err);
        throw error(err.status || 500, { message: err.message || 'Video kaynakları alınamadı' });
    }
}

// Anime detaylarını al
async function getAnimeDetails(titleId) {
    try {
        console.log('Anime detayları isteniyor:', titleId);
        
        // İlk sezon bilgilerini al
        const response = await fetch(
            `${API_BASE_URL}/secure/titles/${titleId}?titleId=${titleId}&seasonNumber=1&episodeNumber=1&page=1&perPage=100`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                }
            }
        );

        if (!response.ok) {
            throw error(404, { message: 'Anime bilgileri bulunamadı' });
        }

        const data = await response.json();
        console.log('API yanıtı:', data);

        // Tüm sezonları ve bölümleri tutacak dizi
        const allEpisodes = [];
        const seasons = data.seasons || [{ number: 1 }];

        // Her sezon için bölümleri kontrol et
        for (const season of seasons) {
            const seasonNumber = season.number || 1;
            let episodeNumber = 1;
            let hasMoreEpisodes = true;

            while (hasMoreEpisodes) {
                try {
                    // Her bölüm için video kontrolü yap
                    const videos = await getVideoSources(titleId, episodeNumber, seasonNumber);
                    
                    if (!Array.isArray(videos) || videos.length === 0) {
                        // Eğer video bulunamazsa, bu sezon için bölümlerin bittiğini varsay
                        hasMoreEpisodes = false;
                        continue;
                    }

                    // Çeviri ekiplerine göre grupla
                    const groupedByFansub = {};
                    videos.forEach(video => {
                        const fansub = video.extra || video.name;
                        if (!groupedByFansub[fansub]) {
                            groupedByFansub[fansub] = [];
                        }
                        groupedByFansub[fansub].push({
                            url: video.url,
                            type: video.type || 'embed',
                            quality: video.quality || 'regular',
                            provider: video.name,
                            name: video.name,
                            fansub: video.extra || video.name,
                            language: video.language || 'tr'
                        });
                    });

                    // Video kaynaklarını düzenle
                    const videoSources = Object.entries(groupedByFansub).map(([fansub, sources]) => ({
                        fansub,
                        sources
                    }));

                    // Bölümü listeye ekle
                    allEpisodes.push({
                        episode: episodeNumber,
                        season: seasonNumber,
                        title: `Bölüm ${episodeNumber}`,
                        videos: videoSources
                    });

                    episodeNumber++;

                    // 100 bölümden sonra durdur (güvenlik için)
                    if (episodeNumber > 100) {
                        hasMoreEpisodes = false;
                    }
                } catch (err) {
                    console.error(`Sezon ${seasonNumber} Bölüm ${episodeNumber} kontrol hatası:`, err);
                    hasMoreEpisodes = false;
                }
            }
        }

        // Bölümleri sırala
        allEpisodes.sort((a, b) => {
            if (a.season === b.season) {
                return a.episode - b.episode;
            }
            return a.season - b.season;
        });

        // Anime listesini güncelle
        const animeList = loadAnimeList();
        animeList[titleId] = {
            name: data.name || 'Bilinmeyen Anime',
            logoUrl: data.coverImage || data.poster || '',
            bolumler: allEpisodes
        };

        saveAnimeList(animeList);

        return {
            ...data,
            name: data.name || 'Bilinmeyen Anime',
            bolumler: allEpisodes,
            totalEpisodes: allEpisodes.length,
            totalSeasons: seasons.length
        };
    } catch (err) {
        console.error('Anime detayları alınırken hata:', err);
        throw error(err.status || 500, { message: err.message || 'Anime bilgileri alınamadı' });
    }
}

export async function GET({ params }) {
    try {
        const { id, episode } = params;
        console.log('Video detayları isteniyor:', { id, episode });

        if (!id) {
            throw error(400, { message: 'Anime ID gerekli' });
        }

        // Önce yerel dosyadan kontrol et
        const animeList = loadAnimeList();
        const anime = animeList[id];
        
        // Eğer anime zaten yüklenmişse ve bölümleri varsa
        if (anime && anime.bolumler && anime.bolumler.length > 0) {
            // Bölümleri sezonlara göre grupla
            const episodesBySeason = anime.bolumler.reduce((acc, b) => {
                const season = b.season || 1;
                if (!acc[season]) {
                    acc[season] = [];
                }
                acc[season].push(b);
                return acc;
            }, {});

            // Her sezondaki bölümleri sırala
            Object.values(episodesBySeason).forEach(episodes => {
                episodes.sort((a, b) => a.episode - b.episode);
            });

            // Eğer belirli bir bölüm istenmişse
            if (episode) {
                const savedEpisode = anime.bolumler.find(b => b.episode === parseInt(episode));
                if (savedEpisode) {
                    return new Response(JSON.stringify({
                        episode: parseInt(episode),
                        season: savedEpisode.season,
                        title: savedEpisode.title,
                        videos: savedEpisode.videos,
                        episodesBySeason
                    }), {
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'public, max-age=3600'
                        }
                    });
                }
            }

            // Bölüm belirtilmemişse tüm bölümleri döndür
            return new Response(JSON.stringify({
                name: anime.name,
                logoUrl: anime.logoUrl,
                episodesBySeason
            }), {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'public, max-age=3600'
                }
            });
        }

        // Yerel dosyada yoksa veya güncel değilse API'den çek
        const animeDetails = await getAnimeDetails(id);
        
        // Bölümleri sezonlara göre grupla
        const episodesBySeason = animeDetails.bolumler.reduce((acc, b) => {
            const season = b.season || 1;
            if (!acc[season]) {
                acc[season] = [];
            }
            acc[season].push(b);
            return acc;
        }, {});

        // Her sezondaki bölümleri sırala
        Object.values(episodesBySeason).forEach(episodes => {
            episodes.sort((a, b) => a.episode - b.episode);
        });

        // Eğer belirli bir bölüm istenmişse
        if (episode) {
            const savedEpisode = animeDetails.bolumler.find(b => b.episode === parseInt(episode));
            if (savedEpisode) {
                return new Response(JSON.stringify({
                    episode: parseInt(episode),
                    season: savedEpisode.season,
                    title: savedEpisode.title,
                    videos: savedEpisode.videos,
                    episodesBySeason
                }), {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'public, max-age=3600'
                    }
                });
            }
        }

        // Bölüm belirtilmemişse tüm bölümleri döndür
        return new Response(JSON.stringify({
            name: animeDetails.name,
            logoUrl: animeDetails.coverImage || animeDetails.poster,
            episodesBySeason
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        console.error('Video detayları yüklenirken hata:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Bir hata oluştu'
        }), {
            status: err.status || 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
} 