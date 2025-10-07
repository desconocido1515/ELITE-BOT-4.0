let mutedUsers = new Set();

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!m.chat.endsWith('@g.us')) {
        return conn.reply(m.chat, '❌ *Este comando solo funciona en grupos*', m);
    }
    if (!isBotAdmin) return conn.reply(m.chat, '❌ *El bot necesita ser administrador*', m);
    if (!isAdmin) return conn.reply(m.chat, '❌ *Solo administradores pueden usar este comando*', m);

    // ✅ Obtener usuario (igual que tu comando follar)
    let user;
    if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted) {
        user = m.quoted.sender;
    } else {
        return conn.reply(m.chat, `❌ *Debes mencionar o responder a un mensaje*\n\nEjemplo:\n• ${usedPrefix}${command} @usuario\n• ${usedPrefix}${command} (respondiendo a mensaje)`, m);
    }

    console.log('Usuario detectado:', user); // Debug

    // Obtener el número real del usuario
    let userNumber = user.split('@')[0];
    
    // Para mostrar en el mensaje, usar solo los últimos 10 dígitos (número de teléfono)
    let displayNumber = userNumber.length > 10 ? userNumber.slice(-10) : userNumber;

    if (command === "mute") {
        if (mutedUsers.has(user)) {
            return conn.reply(m.chat, `❌ *El usuario ya está muteado* @${displayNumber}`, m, { mentions: [user] });
        }
        mutedUsers.add(user);
        conn.reply(m.chat, `✅ *Usuario muteado:* @${displayNumber}\n\n⚠️ *Ahora se eliminarán sus mensajes automáticamente*`, m, { mentions: [user] });
    
    } else if (command === "unmute") {
        if (!mutedUsers.has(user)) {
            return conn.reply(m.chat, `❌ *El usuario no está muteado* @${displayNumber}`, m, { mentions: [user] });
        }
        mutedUsers.delete(user);
        conn.reply(m.chat, `✅ *Usuario desmuteado:* @${displayNumber}`, m, { mentions: [user] });
    }
};

// ✅ Función que elimina mensajes de usuarios muteados
handler.before = async (m, { conn }) => {
    if (m.chat.endsWith('@g.us') && mutedUsers.has(m.sender)) {
        try {
            // No eliminar stickers para evitar errores
            if (m.mtype !== 'stickerMessage') {
                await conn.sendMessage(m.chat, { delete: m.key });
            }
        } catch (e) {
            console.error('Error eliminando mensaje:', e);
        }
        return true; // Detener el procesamiento del mensaje
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
