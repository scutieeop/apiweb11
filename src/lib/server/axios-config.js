import axios from 'axios';

// Axios instance oluştur
const axiosInstance = axios.create({
    timeout: 10000, // 10 saniye timeout
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
});

// Retry mekanizması ekle
axiosInstance.interceptors.response.use(null, async (error) => {
    const { config } = error;
    if (!config || !config.retry) {
        return Promise.reject(error);
    }

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.retry) {
        return Promise.reject(error);
    }

    config.retryCount += 1;

    const delayRetry = new Promise(resolve => {
        setTimeout(resolve, 1000 * config.retryCount); // Her denemede artan bekleme süresi
    });

    await delayRetry;
    return axiosInstance(config);
});

// Default retry ayarları
axiosInstance.defaults.retry = 3;

export default axiosInstance; 