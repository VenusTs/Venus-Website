import express, { Request, Response } from 'express';
import path from 'path';
import fetch from 'node-fetch';
import btoa from 'btoa';
import { catchAsyncErrors } from '../util/handlers';
import { filterGuilds } from '../util/handlers';
import { getGuild } from './database';

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent('http://localhost:8080/api/callback');

let managedGuilds: { [key: string]: any }[];

router.get('/login', (_req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds`);
});

router.get(
    '/callback',
    catchAsyncErrors(async (req: Request, res: Response) => {
        const code = req.query.code;
        if (!code) throw new Error('NO_CODE');

        const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
        const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`
            }
        });
        const token = (await response.json()).access_token;
        res.redirect(`/api/get?token=${token}`);
    })
);

router.get(
    '/get',
    catchAsyncErrors(async (req: Request, res: Response) => {
        const token = req.query.token;
        if (!token) throw new Error('NO_TOKEN');

        const userResponse = await fetch('http://discordapp.com/api/users/@me', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const user = await userResponse.json();

        const guildResponse = await fetch('http://discordapp.com/api/users/@me/guilds', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const guilds = await guildResponse.json();

        managedGuilds = filterGuilds(guilds).map((guild: { [key: string]: string }) => {
            return {
                id: guild.id,
                name: guild.name,
                icon: guild.icon ? `https://cnd.discordapp.com/icons/${guild.id}/${guild.icon}.webp` : null
            };
        });

        await Promise.all(managedGuilds.map(async guild => (guild.settings = await getGuild(guild.id!))));

        res.redirect('/api/server-overview');
    })
);

router.get(
    '/server-overview',
    catchAsyncErrors(async (_req: Request, res: Response) => {
        res.render(path.join(__dirname, '../../pages/dashboard.ejs'), { guilds: managedGuilds.filter(guild => guild.settings) });
    })
);

module.exports = router;
