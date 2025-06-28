// node packages

// NPM packages
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookiePasrser = require('cookie-parser');

// our own packages
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');
const redisClient = require('./utils/redisClient');

// routers
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRouter');
const uploadRouter = require('./routes/uploadRouter');
const userRouter = require('./routes/userRouter');

const app = express();

// middlewares
app.use(cookiePasrser(process.env.SIGNED_COOKIE_SECRET));
app.use(express.json());
app.use(express.static('./public'));

// routes
app.get('/api/v1', (req, res) => {
    res.status(200).json({ status: 'success', msg: 'Hello World' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/users', userRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = 5000 || process.env.PORT;

const startServer = async () => {
    try {
        // connect to DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB...');
        // connect to Redis
        await redisClient.connect();
        console.log('Connected to redis...');
        // make the server listen on PORT
        app.listen(5000, () => console.log(`Server is listening on port: ${PORT}...`));
    } catch (error) {
        console.log(error);
    }
};

startServer();
