const express = require('express');
const path = require('path');
require('dotenv').config()

const app = express();

app.get('/', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dashboard', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, './pages/dashboard.html'))
})

app.listen(8080, () => {
    console.info('Running on port 8080');
});

// Routes
app.use('/api/discord', require('./api/discord'));

// ERRORS
app.use((err, req, res, next) => {
    switch (err.message) {
        case 'NO_CODE':
            return res.status(400).send({
                status: 'ERROR',
                error: 'No Code found',
            });
        case 'NO_TOKEN':
            return res.status(400).send({
                status: 'ERROR',
                error: 'No Token found',
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message,
            });
    }
});