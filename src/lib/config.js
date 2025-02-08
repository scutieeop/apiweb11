export const config = {
    // Discord giriş durumu
    DISCORD_LOGIN_ENABLED: false,
    
    // Discord erişim mesajı
    DISCORD_ACCESS_MESSAGE: "Discord'a Türkiye'den erişim kısıtlaması nedeniyle giriş sistemi geçici olarak devre dışı bırakılmıştır.",
    
    // Site ayarları
    SITE_NAME: "Animax",
    SITE_URL: process.env.NODE_ENV === 'production' ? 'https://animax.net.tr' : 'http://localhost:3000',
    
    // API ayarları
    API_VERSION: "v1",
    
    // Cache ayarları
    CACHE_DURATION: 3600, // 1 saat
    
    // Güvenlik ayarları
    MAX_LOGIN_ATTEMPTS: 3,
    LOGIN_COOLDOWN: 300, // 5 dakika
    
    // Özellik bayrakları
    FEATURES: {
        GUEST_VIEWING: true,      // Misafir izleme
        COMMENTS: false,          // Yorumlar
        WATCHLIST: false,         // İzleme listesi
        NOTIFICATIONS: false      // Bildirimler
    }
}; 