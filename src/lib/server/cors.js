// İzin verilen domainler
const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://animax.net.tr'
];

// CORS headers oluştur
export function corsHeaders(origin) {
    // Origin kontrolü
    const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

    return {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '3600'
    };
}

// CORS middleware
export async function handleCors({ request, resolve }) {
    const origin = request.headers.get('origin');
    
    // OPTIONS isteklerini hemen yanıtla
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            headers: corsHeaders(origin)
        });
    }

    // Diğer istekleri işle ve CORS header'larını ekle
    const response = await resolve(request);
    const newHeaders = new Headers(response.headers);
    
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
        newHeaders.set(key, value);
    });

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
    });
} 