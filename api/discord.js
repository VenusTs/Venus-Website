const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('../util/Util');
const { filterGuilds } = require('../util/handlers.js');

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent('http://localhost:8080/api/callback');

let managedGuilds;

router.get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds`);
});

router.get(
    '/callback',
    catchAsync(async (req, res) => {
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
    catchAsync(async (req, res) => {
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
        managedGuilds = filterGuilds(guilds).map(guild => {
            return {
                id: guild.id,
                name: guild.name,
                icon: guild.icon ? `https://cnd.discordapp.com/icons/${guild.id}/${guild.icon}.webp` : null
            };
        });

        res.redirect('/api/dashboard');
    })
);

router.get(
    '/dashboard',
    catchAsync(async (req, res) => {
        res.render(path.join(__dirname, '../pages/dashboard.ejs'), { guilds: managedGuilds });
    })
);

module.exports = router;
