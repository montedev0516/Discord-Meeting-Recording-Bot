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

// Schedule recordings
function setupScheduledRecordings() {
    schedule.scheduleJob('0 20 * * 1,3', () => checkAndStartRecording(SCA_CHANNEL_ID));
    schedule.scheduleJob('0 14 * * 0', () => checkAndStartRecording(SCMA_CHANNEL_ID));
}

// Check for scheduled recordings
async function checkAndStartRecording(channelId) {
    const channel = await client.channels.fetch(channelId);
    if (!channel) return;

    const founderPresent = channel.members.some(member => member.roles.cache.has(FOUNDER_ROLE_ID));
    if (founderPresent && !isRecording) {
        startRecording(channel);
    }
}

// Start recording logic
async function startRecording(channel) {
    currentConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    isConnectionDestroyed = false;

    try {
        // await entersState(currentConnection, VoiceConnectionStatus.Ready, 10e3);
        console.log(`Started recording in ${channel.name}`);

        // Start recording using ffmpeg-static
        recordingName = `recording_${Date.now()}.mp4`;
        // recordingProcess = exec(`${ffmpegpath} -f gdigrab -framerate 30 -i desktop -probesize 32 -c:v libx264 -pix_fmt yuv420p recording_${Date.now()}.mp4`);
        // recordingProcess = exec(`${ffmpegpath} -f gdigrab -framerate 30 -i title="Discord" -video_size 1280x720 recording_${Date.now()}.mp4`);
        // recordingProcess = exec(`${ffmpegpath} -f gdigrab -framerate 30 -i title="Discord" -probesize 32 -f dshow -i audio="VB-Audio Virtual Cable" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k recording_${Date.now()}.mp4`);
        // recordingProcess = exec(`${ffmpegpath} -f gdigrab -framerate 30 -i desktop -probesize 32 -f dshow -i audio="Stereo Mix (Realtek(R) Audio)" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k recording_${Date.now()}.mp4`);
        recordingProcess = exec(`${ffmpegpath} -f gdigrab -framerate 30 -i desktop -probesize 32 -f dshow -i audio="Microphone (Realtek(R) Audio)" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k recording_${Date.now()}.mp4`);
        
        recordingProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });
        
        recordingProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });
        
        recordingProcess.on('close', (code) => {
            console.log(`Capture process exited with code ${code}`);
        });

        isRecording = true;

        // // Monitor for founder leaving
        // const interval = setInterval(async () => {
        //     const updatedChannel = await client.channels.fetch(channel.id);
        //     const founderStillPresent = updatedChannel.members.some(member => member.roles.cache.has(FOUNDER_ROLE_ID));
        //     if (!founderStillPresent) {
        //         clearInterval(interval);
        //         await stopRecording(); // Make sure to await stopRecording
        //     }
        // }, 10000); // Check every 10 seconds
        
    } catch (error) {
        console.error('Error starting recording:', error);
    }
}

// Stop recording logic
async function stopRecording(RECORDING_CHANNEL_ID) {
    if (isConnectionDestroyed) {
        console.log("Voice connection is already destroyed.");
        return; // Exit early if already destroyed
    }

    if (currentConnection) {
        currentConnection.destroy(); // Ensure we destroy the connection if it's valid
        isConnectionDestroyed = true; // Mark the connection as destroyed
    }
    
    isRecording = false;
    
    if (recordingProcess) {
        // recordingProcess.kill('SIGINT'); // Stop ffmpeg process
        recordingProcess.stdin.write('q');
        // recordingProcess.stdin.end();
        console.log('Stopped recording');
        
        console.log(RECORDING_CHANNEL_ID);
        
        // Upload to YouTube after stopping the recording
        // await uploadToYoutube(RECORDING_CHANNEL_ID); // Placeholder for upload function
    }
}