require('dotenv').config();
import express, { Response, Request, NextFunction } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { getGuild } from './api/database';

const app = express();

app.set('view engine', 'ejs');

app.get('/', (_req, res) => {
    res.render(path.join(__dirname, '../index.ejs'), { title: 'VenusTS' });
});

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.post('/dashboard', async (req, res) => {
    const guild = await getGuild(req.body.guildPicker);
    res.send(guild);
});

app.listen(8080, () => {
    console.info('Running on port 8080');
});

// Routes
app.use('/api', require('./api/discord'));

// ERRORS
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
