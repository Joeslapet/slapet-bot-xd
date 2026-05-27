import moment from 'moment-timezone';
import CONFIG from './config.js';

const antiDeleteCache = new Set();
const antiEditCache = new Set();
export const messageStore = new Map();

/* ================= CLEAN STORE ================= */

export function cleanMessageStore() {
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;

  for (const [key, value] of messageStore.entries()) {
    if (now - value.timestamp > tenMinutes) {
      messageStore.delete(key);
    }
  }
}

/* ================= HELPERS ================= */

function getPhoneFromJid(jid) {
  if (!jid) return null;

  if (jid.includes('@s.whatsapp.net')) {
    const match = jid.match(/^(\d+)@/);
    return match ? match[1] : null;
  }

  if (jid.includes('@lid')) {
    const match = jid.match(/^(\d+)@lid/);
    return match ? match[1] : null;
  }

  const match = jid.match(/^(\d+):/);
  if (match) return match[1];

  const simple = jid.match(/^(\d+)@/);
  return simple ? simple[1] : null;
}

function getCleanJid(jid) {
  if (!jid) return null;
  if (jid.includes(':')) {
    const parts = jid.split(':');
    return parts[0] + '@' + parts[1].split('@')[1];
  }
  return jid;
}

function formatPhoneNumber(phone) {
  if (!phone || phone === 'Unknown') return 'Unknown';
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/* ================= ANTI DELETE ================= */

export async function handleDeletedMessage(msg, sock, getRealSenderJid) {
  try {
    const protocolMsg = msg.message.protocolMessage;
    if (!protocolMsg || protocolMsg.type !== 0) return;

    const deletedMsgId = protocolMsg.key.id;
    const deleterJid = getRealSenderJid(msg);
    const from = msg.key.remoteJid;

    if (deleterJid === sock.user.id) return;

    const cacheKey = `${deletedMsgId}_${deleterJid}_delete`;
    if (antiDeleteCache.has(cacheKey)) return;

    antiDeleteCache.add(cacheKey);
    setTimeout(() => antiDeleteCache.delete(cacheKey), 5000);

    const deletedMsg = messageStore.get(deletedMsgId);
    if (!deletedMsg) return;

    const originalMsgBody =
      deletedMsg.message?.conversation ||
      deletedMsg.message?.extendedTextMessage?.text ||
      deletedMsg.message?.imageMessage?.caption ||
      deletedMsg.message?.videoMessage?.caption ||
      '[Media]';

    await sock.sendMessage(from, {
      text:
`*⚡ ANTI-DELETE ⚡*\n\n🗑️ A message was deleted\n👤 By: ${deleterJid}\n\n📱 Content:\n"${originalMsgBody}"`
    });

    messageStore.delete(deletedMsgId);

  } catch (e) {
    console.log('AntiDelete error:', e.message);
  }
}

/* ================= ANTI EDIT ================= */

export async function handleEditedMessage(msg, sock, getRealSenderJid) {
  try {
    const protocolMsg = msg.message.protocolMessage;
    if (!protocolMsg || protocolMsg.type !== 14) return;
    if (!CONFIG.ANTIEDIT) return;

    const editedMsgId = protocolMsg.key.id;
    const editorJid = getRealSenderJid(msg);
    const from = msg.key.remoteJid;

    if (editorJid === sock.user.id) return;

    const cacheKey = `${editedMsgId}_${editorJid}_edit`;
    if (antiEditCache.has(cacheKey)) return;

    antiEditCache.add(cacheKey);
    setTimeout(() => antiEditCache.delete(cacheKey), 5000);

    const originalMsg = messageStore.get(editedMsgId);
    if (!originalMsg) return;

    const originalText =
      originalMsg.message?.conversation ||
      originalMsg.message?.extendedTextMessage?.text ||
      '[Media]';

    const editedText =
      protocolMsg.editedMessage?.conversation ||
      protocolMsg.editedMessage?.extendedTextMessage?.text ||
      '[Edited]';

    await sock.sendMessage(from, {
      text:
`*⚡ ANTI-EDIT ⚡*\n\n✏️ Message edited\n👤 By: ${editorJid}\n\n📱 Original:\n"${originalText}"\n\n📝 Edited:\n"${editedText}"`
    });

    messageStore.set(editedMsgId, { ...msg, timestamp: Date.now() });

  } catch (e) {
    console.log('AntiEdit error:', e.message);
  }
}
