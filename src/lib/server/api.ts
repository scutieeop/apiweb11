import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import connectDB, { getDb } from './db';
import type { RequestHandler } from '@sveltejs/kit';

const app = express();
const PORT = 5000;

// CORS ayarları - sadece kendi sitemizden gelen isteklere izin ver
const corsOptions = {
    origin: ['http://localhost:3000', 'http://192.168.2.52:3000'],
    methods: ['GET', 'POST'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API güvenliği için özel bir anahtar kontrolü
const API_KEY = 'gizli-api-anahtari';

// API anahtarı kontrolü için middleware
const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== API_KEY) {
        res.status(401).json({ error: 'Geçersiz API anahtarı' });
        return;
    }
    next();
};

// Kayıt API endpoint'i
app.get('/api/register/:username/:email/:password/:confirmPassword', async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, email, password, confirmPassword } = req.params;

        // Şifre kontrolü
        if (password !== confirmPassword) {
            res.status(400).json({ error: 'Şifreler eşleşmiyor' });
            return;
        }

        // Boş alan kontrolü
        if (!username || !email || !password) {
            res.status(400).json({ error: 'Tüm alanları doldurun' });
            return;
        }

        // Email formatı kontrolü
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ error: 'Geçerli bir email adresi girin' });
            return;
        }

        await connectDB();
        const database = getDb();
        
        // Email kontrolü
        const existingUser = await database.collection('animaxv2').findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: 'Bu e-posta adresi zaten kullanımda' });
            return;
        }

        // Şifre hashleme
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Kullanıcı oluşturma
        const user = {
            username,
            email,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date()
        };

        await database.collection('animaxv2').insertOne(user);
        res.status(201).json({ 
            success: true, 
            message: 'Kayıt başarılı',
            user: {
                username,
                email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ error: 'Kayıt işlemi sırasında bir hata oluştu' });
    }
});

// Giriş API endpoint'i
app.get('/api/login/:email/:password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.params;

        if (!email || !password) {
            res.status(400).json({ error: 'Email ve şifre gerekli' });
            return;
        }

        await connectDB();
        const database = getDb();
        
        const user = await database.collection('animaxv2').findOne({ email });
        
        if (!user) {
            res.status(400).json({ error: 'Kullanıcı bulunamadı' });
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ error: 'Geçersiz şifre' });
            return;
        }

        res.status(200).json({ 
            success: true, 
            message: 'Giriş başarılı',
            user: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ error: 'Giriş işlemi sırasında bir hata oluştu' });
    }
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		// JSON verisini oku
		const { username, email, password, confirmPassword } = await request.json();

		// Gerekli kontroller
		if (!username || !email || !password || !confirmPassword) {
			return new Response(JSON.stringify({ error: 'Tüm alanları doldurun' }), { status: 400 });
		}
		if (password !== confirmPassword) {
			return new Response(JSON.stringify({ error: 'Şifreler eşleşmiyor' }), { status: 400 });
		}
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return new Response(JSON.stringify({ error: 'Geçerli bir email adresi girin' }), { status: 400 });
		}

		await connectDB();
		const database = getDb();
		const existingUser = await database.collection('animaxv2').findOne({ email });
		if (existingUser) {
			return new Response(JSON.stringify({ error: 'Bu e-posta adresi zaten kullanımda' }), { status: 400 });
		}

		// Şifre hashleme
		const hashedPassword = await bcrypt.hash(password, 10);
		const user = {
			username,
			email,
			password: hashedPassword,
			role: 'user',
			createdAt: new Date()
		};

		await database.collection('animaxv2').insertOne(user);
		return new Response(
			JSON.stringify({
				success: true,
				message: 'Kayıt başarılı',
				user: { username, email, role: user.role }
			}),
			{ status: 201 }
		);
	} catch (error) {
		console.error('Kayıt hatası:', error);
		return new Response(JSON.stringify({ error: 'Kayıt işlemi sırasında bir hata oluştu' }), { status: 500 });
	}
};

app.listen(PORT, () => {
    console.log(`API sunucusu ${PORT} portunda çalışıyor`);
}); 