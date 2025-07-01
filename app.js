// node packages

// NPM packages
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookiePasrser = require('cookie-parser');

//security packages
const cors = require('cors');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const expressMongoSanitize = require('@exortek/express-mongo-sanitize');

// our own packages
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const redisClient = require('./utils/redisClient');

// routers
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRouter');
const uploadRouter = require('./routes/uploadRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_HOST,
        credentials: true, // if you ever send cookies
        exposedHeaders: ['Authorization'],
    })
);

app.set('trust proxy', 1);
const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: 'Too many requests from this IP. Please, try again in 15 minutes',
    validate: {
        trustProxy: 'acknowledged', // 🔥 Must be set if trust proxy is true
    },
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: 'Too many requests from this IP. Please, try again in 15 minutes',
    validate: {
        trustProxy: 'acknowledged', // 🔥 Must be set if trust proxy is true
    },
});

// middlewares

app.use(cookiePasrser(process.env.SIGNED_COOKIE_SECRET));
app.use(express.json());
app.use(express.static('./public'));
app.use(helmet());
app.use(xss());
app.use(expressMongoSanitize());

// routes
app.get('/api/v1', (req, res) => {
    res.status(200).json({ status: 'success', msg: 'Hello World' });
});

app.use('/api/v1/auth', loginLimiter, authRouter);
app.use('/api/v1/users', userRouter);
app.use(appLimiter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');
        // connect to Redis
        await redisClient.connect();
        console.log('Connected to redis...');
        // make the server listen on PORT
        app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}...`));
    } catch (error) {
        console.log(error);
    }
};

startServer();
