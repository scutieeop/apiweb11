/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
declare global {
	namespace App {
		interface Error {
			message: string;
			code?: string;
		}
		interface Locals {
			user: import('$lib/types').User | null;
			session?: {
				userId: string;
				username: string;
				avatar?: string;
			};
		}
		interface PageData {
			user: import('$lib/types').User | null;
			session?: {
				userId: string;
				username: string;
				avatar?: string;
			};
		}
		interface Platform {}
	}

	namespace NodeJS {
		interface ProcessEnv {
			MONGODB_URI: string;
			DISCORD_CLIENT_SECRET: string;
			VITE_DISCORD_CLIENT_ID: string;
			SESSION_SECRET: string;
		}
	}
}

declare module 'express-session' {
	interface SessionData {
		user: {
			id: string;
			username: string;
			avatar?: string;
		};
	}
}

export {};
