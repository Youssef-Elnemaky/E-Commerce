// node packages

// NPM packages
const express = require('express');

// our own packages
const notFoundMiddleware = require('./middlewares/not-found');
const errorHandlerMiddleware = require('./middlewares/error-handler');

// routers

const app = express();

// middlewares
app.use(express.json());

// routes
app.get('/api/v1', (req, res) => {
    res.status(200).json({ status: 'success', msg: 'Hello World' });
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = 5000 || process.env.PORT;
app.listen(5000, () => console.log(`Server is listening on port: ${PORT}...`));
