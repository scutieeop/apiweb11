/// <reference types="@sveltejs/kit" />
declare module "$env/static/private" {
    export const MONGODB_URI: string;
    export const SESSION_SECRET: string;
    export const JWT_SECRET: string;
} 