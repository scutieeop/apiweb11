import { error, json } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';

interface Profile {
    _id?: any;
    username: string;
    avatar?: string;
    isPrivate: boolean;
    bio?: string;
    discordId: string;
}

export const POST = async ({ params, cookies }) => {
    const db = getDb();

    const sessionData = cookies.get('session');
    const session = sessionData ? JSON.parse(sessionData) : null;

    const rawProfile = await db.collection('animaxv2').findOne({ username: params.username }) as Profile;

    if (!rawProfile) {
        throw error(404, 'Profile not found');
    }

    // Format the profile data
    const profile: Profile = {
        ...rawProfile,
        _id: rawProfile._id.toString(),
        isPrivate: !!rawProfile.isPrivate,
        bio: rawProfile.bio || ''
    };

    // If profile is private and the user is not the owner, limit the visible data
    if (profile.isPrivate && (!session || session.userId !== profile.discordId)) {
        return json({
            profile: {
                username: profile.username,
                avatar: profile.avatar,
                isPrivate: true,
                bio: profile.bio
            },
            isOwner: false
        });
    }
    return json({
        profile: {
            ...profile,
            isPrivate: !!profile.isPrivate,
            bio: profile.bio || ''
        },
        isOwner: session?.userId === profile.discordId
    });
};
