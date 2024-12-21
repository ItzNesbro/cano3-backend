"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const discord_js_1 = __importStar(require("discord.js"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const client = new discord_js_1.default.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages
    ],
    partials: [
        discord_js_1.default.Partials.Message,
        discord_js_1.default.Partials.Channel,
        discord_js_1.default.Partials.Reaction
    ]
});
app.use((0, cors_1.default)());
const port = 3000;
const storage = multer_1.default.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (_req, file, cb) {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({ storage: storage });
client.on('ready', () => {
    var _a;
    console.log(`Logged in as ${(_a = client.user) === null || _a === void 0 ? void 0 : _a.tag}!`);
});
app.get('/', (_req, res) => {
    res.send('Hello World!');
});
app.post('/upload', upload.single('screenshot'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const { email, address, item, price, color, sets } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;
    if (!email || !address || !item || !price || !color || !sets) {
        return res.status(400).send({ message: 'Missing required fields.' });
    }
    const channelId = process.env.CHANNEL_ID;
    const backendUrl = process.env.API_URL;
    const channel = client.channels.cache.get(channelId);
    const embed = new discord_js_1.default.EmbedBuilder()
        .setTitle('New order')
        .setColor(0x0099ff)
        .setDescription(`Email: ${email}\nAddress: ${address}\nItem: ${item}\nPrice: ${price}\nColor: ${color}\nSets: ${sets}`)
        .setImage(`${backendUrl}/uploads/${req.file.filename}`);
    channel.send({ embeds: [embed] });
    res.send({ message: 'Data received successfully.', fileUrl });
});
app.use('/uploads', express_1.default.static('uploads'));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
client.login(process.env.BOT_TOKEN);
