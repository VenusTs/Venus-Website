const express = require('express');
const fetch = require('node-fetch');
const btoa = require('btoa');
const { catchAsync } = require('../Util');

const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const redirect = encodeURIComponent('http://localhost:8080/api/discord/callback');

router.get('/login', (req, res) => {
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds`);
});

router.get('/callback', catchAsync(async (req, res) => {
    const code = req.query.code;
    if (!code) throw new Error('NO_CODE');

    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
            },
        });
    const token = (await response.json()).access_token;
    res.redirect(`/api/discord/get?token=${token}`);
}));


router.get('/get', catchAsync(async (req, res) => {
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
    const guild = await guildResponse.json();

    console.log(user);
    console.log(guild);
    res.redirect(`/dashboard`);
}))

module.exports = router;

