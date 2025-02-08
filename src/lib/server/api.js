import express from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { env } from '$env/dynamic/private';

const app = express();

app.use(cors());
app.use(express.json());

/** @type {import('express-session').SessionOptions} */
const sessionConfig = {
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: env.MONGODB_URI,
        ttl: 14 * 24 * 60 * 60 // 14 gün
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 14 // 14 gün
    }
};

app.use(session(sessionConfig));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`API sunucusu ${PORT} portunda çalışıyor`);
}); 