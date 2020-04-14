import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_STRING!, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', err => console.error(err));

db.once('open', () => console.log(`Connected to MongoDB Atlas at ${db.name}!`));

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

export const getGuild = async (guildId: string) => {
    return await guilds.findOne({ guild: guildId });
};
