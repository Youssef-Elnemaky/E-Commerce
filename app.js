// node packages

// NPM packages
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cookiePasrser = require('cookie-parser');

// our own packages
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');

// routers
const authRouter = require('./routes/authRouter');
const productRouter = require('./routes/productRouter');
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
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// connect to DB
mongoose
    .connect(process.env.MONGO_URI)
    .then(console.log('Connected to DB...'))
    .catch((err) => console.log(err));

const PORT = 5000 || process.env.PORT;
app.listen(5000, () => console.log(`Server is listening on port: ${PORT}...`));
