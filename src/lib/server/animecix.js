const API_BASE_URL = 'https://animecix.net';

const API_HEADERS = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
};

export async function getAnimeDetails(titleId) {
    try {
        console.log('Animecix\'ten anime detayları isteniyor:', { titleId });

        const response = await fetch(`${API_BASE_URL}/api/title/${titleId}`, {
            headers: API_HEADERS
        });

        if (!response.ok) {
            console.error('Anime detayları alınamadı:', await response.text());
            throw new Error('Anime detayları alınamadı');
        }

        const data = await response.json();
        console.log('Anime detayları alındı:', data);

        // Bölümleri sırala
        if (data.episodes) {
            data.episodes.sort((a, b) => {
                if (a.season === b.season) {
                    return a.episode - b.episode;
                }
                return a.season - b.season;
            });
        }

        return {
            name: data.name,
            coverImage: data.coverImage,
            description: data.description,
            type: data.type,
            year: data.year,
            status: data.status,
            genres: data.genres,
            episodes: data.episodes,
            seasonCount: data.seasonCount || 1,
            episodeCount: data.episodeCount || data.episodes?.length || 0
        };
    } catch (err) {
        console.error('Anime detayları alınırken hata:', err);
        throw err;
    }
}

export async function getEpisodeVideos(titleId, episode) {
    try {
        console.log('Animecix\'ten bölüm videoları isteniyor:', { titleId, episode });

        const response = await fetch(`${API_BASE_URL}/api/title/${titleId}/episode/${episode}`, {
            headers: API_HEADERS
        });

        if (!response.ok) {
            console.error('Bölüm videoları alınamadı:', await response.text());
            throw new Error('Bölüm videoları alınamadı');
        }

        const data = await response.json();
        console.log('Bölüm videoları alındı:', data);

        return {
            season: data.season || 1,
            title: data.title || `${episode}. Bölüm`,
            videos: data.videos || []
        };
    } catch (err) {
        console.error('Bölüm videoları alınırken hata:', err);
        throw err;
    }
} 