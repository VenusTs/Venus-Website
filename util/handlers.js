const { Permissions } = require('discord.js')

module.exports.filterGuilds = (guilds) => {
    return guilds.filter(guild => {
        const permissions = new Permissions(guild.permissions)
        return permissions.has('MANAGE_GUILD')
    })
}