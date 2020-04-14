import { Request, Response, NextFunction } from 'express';

const { Permissions } = require('discord.js');

export const filterGuilds = (guilds: { [key: string]: string }[]) => {
    return guilds.filter(guild => {
        const permissions = new Permissions(guild.permissions);
        return permissions.has('MANAGE_GUILD');
    });
};

export const catchAsyncErrors = (fn: CallableFunction) => (req: Request, res: Response, next: NextFunction) => {
    const routePromise = fn(req, res, next);
    if (routePromise.catch) {
        routePromise.catch((err: Error) => next(err));
    }
};
