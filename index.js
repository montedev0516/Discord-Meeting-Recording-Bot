import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { google } from 'googleapis';
import schedule from 'node-schedule';
import { exec } from 'child_process';
import fs from 'fs';
import ffmpegpath from 'ffmpeg-static';

dotenv.config();


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildScheduledEvents,
    ]
});

// const FOUNDER_ROLE_ID = '1106625123945025690';
// const SCA_CHANNEL_ID = '1179853805622403134';
// const SCMA_CHANNEL_ID = '1262350995032379452';
const SCA_RECORDING_CHANNEL_ID = '1181328907060920411';
const SCMA_RECORDING_CHANNEL_ID = '1262365849449271380';

const SCA_CHANNEL_ID = '1303633326707314702';
const SCMA_CHANNEL_ID = '1304453018531659858';
const FOUNDER_ROLE_ID = '1303880042459435018';

const DISCORD_BOT_TOKEN = ''
const YOUTUBE_CLIENT_ID = ''
const YOUTUBE_CLIENT_SECRET = ''
const YOUTUBE_REDIRECT_URI = 'http://localhost:3000/oauth2callback'
const YOUTUBE_REFRESH_TOKEN = 'your_youtube_refresh_token'

let isRecording = false;
let isConnectionDestroyed = false;
let recordingProcess;
let currentConnection;
let recordingName = ``;

client.once('ready', () => {
    console.log('Bot is ready!');
    setupScheduledRecordings();
});