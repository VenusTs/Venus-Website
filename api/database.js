const mongoose = require('mongoose');

mongoose.connect(process.env.mongoString, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', err => logError(err));

db.once('open', () => logInfo(`Connected to MongoDB Atlas at ${db.name}!`));

const GuildSchema = new mongoose.Schema({
    guild: String,
    settings: {
        prefix: String,
        language: String,
        nsfw: Boolean,
        blockedChannels: [String],
        blockedUsers: [String],
        disabledCommands: [String],
        deleteCommandTriggers: Boolean,
        deleteFailedCommands: Boolean
    },
    roles: {
        muted: String
    },
    channels: {
        welcomeChannel: String,
        introChannel: String,
        modLogChannel: String,
        messageLogChannel: String,
        memberLogChannel: String,
        automodLogChannel: String,
        serverLogChannel: String
    },
    permissions: [
        {
            command: String,
            allowed: String,
            users: [String]
        }
    ],
    blacklist: {
        whitelist: [String],
        words: [String]
    },
    welcome: {
        message: String,
        autoRole: String
    }
});

const guilds = mongoose.model('guilds', GuildSchema);

module.exports = guilds;

module.exports.getGuild = async guildId => {
    return (await this.findOne({ guild: guildId })) || (await this.create({ guild: guildId }));
};
