import { Request, Response, NextFunction } from 'express';
import { getGuild } from '../api/database';

const { Permissions } = require('discord.js');

export const filterGuilds = async (guilds: { [key: string]: string }[]) => {
    return await asyncFilter(guilds, async (guild: { [key: string]: string }) => {
        const permissions = new Permissions(guild.permissions);
        return permissions.has('MANAGE_GUILD') && (await getGuild(guild.id));
    });
};

export const catchAsyncErrors = (fn: CallableFunction) => (req: Request, res: Response, next: NextFunction) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
        routePromise.catch((err: Error) => next(err));
    }
};

const asyncFilter = async (arr: any, predicate: any) => Promise.all(arr.map(predicate)).then(results => arr.filter((_v: any, index: any) => results[index]));
