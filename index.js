import { createRequire } from 'module';
globalThis.require = createRequire(import.meta.url);

import Pino from 'pino';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { Boom } from '@hapi/boom';
import { fileURLToPath } from 'url';
import moment from 'moment-timezone';

import { loadSudoList } from './utils/sudoStore.js';
import CONFIG from './config.js';

import {
  seenStatusIds,
  processStatusMessage,
  handleStatusReply,
  logStatus
} from './bc.js';

import {
  default as makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  downloadMediaMessage
} from '@whiskeysockets/baileys';

import {
  handleDeletedMessage,
  handleEditedMessage,
  messageStore,
  cleanMessageStore
} from './anti.js';

/* ================= GLOBAL ================= */

global.ALLOWED_USERS = loadSudoList();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= DEVELOPER ================= */

const DEVELOPER = {
  name: "Joe Slapet",
  number: "22892864375"
};

function isDeveloper(jid) {
  if (!jid) return false;
  const match = jid.match(/^(\d+)@/);
  return match?.[1] === DEVELOPER.number;
}

/* ================= EXPRESS ================= */

const app = express();
app.get('/', (_, res) => res.send('SLAPET BOT XD V3 RUNNING'));
app.listen(CONFIG.PORT || 3000);

/* ================= AUTH ================= */

const AUTH_DIR = path.join(__dirname, 'auth');

if (!fs.existsSync(AUTH_DIR)) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  if (CONFIG.SESSION) {
    fs.writeFileSync(
      path.join(AUTH_DIR, 'creds.json'),
      Buffer.from(CONFIG.SESSION, 'base64')
    );
  }
}

/* ================= BOT CORE ================= */

let sock;

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: Pino({ level: 'silent' }),
    browser: ['SLAPET BOT XD', 'Chrome', '3.0'],
    printQRInTerminal: true
  });

  sock.ev.on('creds.update', saveCreds);

  /* CONNECTION */
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode;

      console.log('❌ DISCONNECTED:', code);

      if (code !== DisconnectReason.loggedOut) {
        setTimeout(start, 5000);
      }
    }

    if (connection === 'open') {
      console.log('✅ CONNECTED TO WHATSAPP');
      console.log(`👑 Developer: ${DEVELOPER.name}`);
    }
  });

  /* MESSAGES */
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message) return;

    const jid = msg.key.remoteJid;

    const body =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption;

    if (!body) return;

    /* PREFIX */
    const prefix = CONFIG.PREFIXES.find(p => body.startsWith(p));
    if (!prefix) return;

    const args = body.slice(prefix.length).trim().split(/\s+/);
    const cmd = args.shift().toLowerCase();

    console.log('CMD:', cmd);

    /* COMMANDS */
    if (cmd === 'ping') {
      await sock.sendMessage(jid, { text: '🏓 Pong!' });
    }

    if (cmd === 'owner') {
      await sock.sendMessage(jid, {
        text: `👑 Owner: ${DEVELOPER.name}\n📞 ${DEVELOPER.number}`
      });
    }

    if (cmd === 'test') {
      await sock.sendMessage(jid, {
        text: '✅ SLAPET BOT XD ONLINE'
      });
    }

    /* STATUS HANDLER (TON LOGIQUE BC.JS CONSERVÉE) */
    try {
      await handleStatusReply(msg, sock);
    } catch (err) {
      console.log('Status error:', err.message);
    }

    /* CLEAN MEMORY */
    cleanMessageStore();
  });
}

/* ================= START ================= */

start();

/* ================= SAFETY ================= */

process.on('SIGINT', () => {
  console.log('🛑 Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Termination signal received');
  process.exit(0);
});
