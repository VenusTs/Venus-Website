const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render(path.join(__dirname, 'index.ejs'), { title: 'VenusTS' });
});

app.get('/dashboard', (req, res) => {
    res.status(200).sendFile(path.join(__dirname, 'pages/dashboard.html'));
});

app.listen(8080, () => {
    console.info('Running on port 8080');
});

// Routes
app.use('/api', require('./api/discord'));

// ERRORS
app.use((err, req, res, next) => {
    switch (err.message) {
        case 'NO_CODE':
            return res.status(400).send({
                status: 'ERROR',
                error: 'No Code found'
            });
        case 'NO_TOKEN':
            return res.status(400).send({
                status: 'ERROR',
                error: 'No Token found'
            });
        default:
            return res.status(500).send({
                status: 'ERROR',
                error: err.message
            });
    }
});
