import express from 'express';
import multer from 'multer';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import discord, { GatewayIntentBits } from 'discord.js';

dotenv.config();
const app = express();

const client = new discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ],
  partials: [
    discord.Partials.Message,
    discord.Partials.Channel,
    discord.Partials.Reaction
  ]
});

app.use(cors());
const port = 3000;

const storage = multer.diskStorage({
  destination: function(_req, _file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(_req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.post('/upload', upload.single('screenshot'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const { email, address, item, price, color, sets } = req.body;
  const fileUrl = `/uploads/${req.file.filename}`;

  if (!email || !address || !item || !price || !color || !sets) {
    return res.status(400).send({ message: 'Missing required fields.' });
  }

  const channelId: any = process.env.CHANNEL_ID;
  const backendUrl: any = process.env.API_URL;

  const channel = client.channels.cache.get(channelId) as discord.TextChannel;
  const embed = new discord.EmbedBuilder()
    .setTitle('New order')
    .setColor(0x0099ff)
    .setDescription(`Email: ${email}\nAddress: ${address}\nItem: ${item}\nPrice: ${price}\nColor: ${color}\nSets: ${sets}`)
    .setImage(`${backendUrl}/uploads/${req.file.filename}`);

  channel.send({ embeds: [embed] });

  res.send({ message: 'Data received successfully.', fileUrl });
});

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

client.login(process.env.BOT_TOKEN);
