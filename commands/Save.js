import { downloadMediaMessage } from '@whiskeysockets/baileys';
import CONFIG from '../config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDéveloppeur : Joe Slapet | Numéro : 22892864375
  if (!CONFIG.Développeur : Joe Slapet | Numéro : 22892864375
  let Développeur : Joe Slapet | Numéro : 22892864375
  Développeur : Joe Slapet | Numéro : 22892864375
  Développeur : Joe Slapet | Numéro : 22892864375
  return `${Développeur : Joe Slapet | Numéro : 22892864375
}

export const commands = [
  {
    name: 'save',
    description: 'Save and forward a replied message to bot Développeur : Joe Slapet | Numéro : 22892864375
    category: 'WhatsApp',
    execute: async ({ sock, from, text, msg }) => {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
      if (!quoted) {
        return sock.sendMessage(from, { text: '❌ Please reply to a message you want to save.' }, { quoted: msg });
      }
      
      const BOT_Développeur : Joe Slapet | Numéro : 22892864375
      
      if (!BOT_Développeur : Joe Slapet | Numéro : 22892864375
        return sock.sendMessage(from, { text: '❌ Développeur : Joe Slapet | Numéro : 22892864375
      }
      
      try {
        const quotedMsg = { message: quoted };
        
        if (quoted.imageMessage) {
          const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console });
          await sock.sendMessage(BOT_Développeur : Joe Slapet | Numéro : 22892864375
            image: buffer, 
            caption: quoted.imageMessage?.caption || '📸 Saved image' 
          });
        } 
        else if (quoted.videoMessage) {
          const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console });
          await sock.sendMessage(BOT_Développeur : Joe Slapet | Numéro : 22892864375
            video: buffer, 
            caption: quoted.videoMessage?.caption || '🎥 Saved video' 
          });
        } 
        else if (quoted.audioMessage) {
          const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console });
          await sock.sendMessage(BOT_Développeur : Joe Slapet | Numéro : 22892864375
            audio: buffer, 
            mimetype: 'audio/mp4',
            ptt: quoted.audioMessage?.ptt || false
          });
        } 
        else if (quoted.stickerMessage) {
          const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console });
          await sock.sendMessage(BOT_Développeur : Joe Slapet | Numéro : 22892864375
        } 
        else if (quoted.documentMessage) {
          const buffer = await downloadMediaMessage(quotedMsg, 'buffer', {}, { logger: console });
          await sock.sendMessage(BOT_Développeur : Joe Slapet | Numéro : 22892864375
            document: buffer, 
            mimetype: quoted.documentMessage?.mimetype,
            fileName: quoted.documentMessage?.fileName || 'document'
          });
        }
        else if (quoted?.conversation || quoted?.extendedTextMessage) {
          const textContent = quoted.conversation || quoted.extendedTextMessage?.text || 'No text content';
          await sock.sendMessage(BOT_Développeur : Joe Slapet | Numéro : 22892864375
        } 
        else {
          return sock.sendMessage(from, { text: '❌ Unsupported message type. Please reply to an image, video, audio, sticker, document, or text message.' }, { quoted: msg });
        }
        
      } catch (err) {
        console.error('Save command error:', err);
        await sock.sendMessage(from, { text: `❌ Failed to save message: ${err.message}` }, { quoted: msg });
      }
    }
  }
];
