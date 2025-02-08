import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
    if (!locals.user || !['admin', 'founder'].includes(locals.user.role)) {
        throw redirect(303, '/');
    }

    return {
        user: locals.user
    };
} 