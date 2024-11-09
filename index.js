import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import { joinVoiceChannel, entersState, VoiceConnectionStatus } from '@discordjs/voice';
import { google } from 'googleapis';
import schedule from 'node-schedule';
import { exec } from 'child_process';
import fs from 'fs';
import ffmpegpath from 'ffmpeg-static';