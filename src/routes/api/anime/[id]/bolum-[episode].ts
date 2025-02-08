import type { RequestHandler } from '@sveltejs/kit';
import fs from 'fs/promises';
import path from 'path';

export const GET: RequestHandler = async ({ params }) => {
	// Extract parameters
	const { id, episode } = params;
  
	// ...existing code to fetch real anime data...
	// For this example, we simulate anime details and episodes.
	const animeData = {
		name: "Naruto", // Replace with real data
		animeLogo: "/images/naruto-logo.png", // Replace with real data
		episode_count: 220,
		episodes: Array.from({ length: 220 }, (_, i) => ({
			number: i + 1,
			title: `${i + 1}. Bölüm`
		}))
	};

	const currentEpisode = animeData.episodes.find(e => e.number === parseInt(episode));
	if (!currentEpisode) {
		return new Response(JSON.stringify({ error: 'Bölüm bulunamadı' }), { status: 404 });
	}

	// Define file path and read current data if exists
	const dataFilePath = path.resolve('d:/svelte/data/animelist.json');
	let animelist = {};
	try {
		const fileContent = await fs.readFile(dataFilePath, 'utf8');
		animelist = JSON.parse(fileContent);
	} catch (e) {
		// File not exist yet, start new
		animelist = {};
	}

	// Update the file structure: anime adi as key with animeLogo and bolumler (all episodes)
	animelist[animeData.name] = {
		animeLogo: animeData.animeLogo,
		bolumler: animeData.episodes
	};

	await fs.writeFile(dataFilePath, JSON.stringify(animelist, null, 2), 'utf8');

	return new Response(
		JSON.stringify({
			success: true,
			message: 'Anime bolumleri yüklendi ve dosyaya yazıldı',
			data: animeData
		}),
		{ status: 200 }
	);
};
