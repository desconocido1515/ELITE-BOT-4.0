let mutedUsers = new Set();

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!m.chat.endsWith('@g.us')) {
        return conn.reply(m.chat, '❌ *Este comando solo funciona en grupos*', m);
    }
    if (!isBotAdmin) return conn.reply(m.chat, '❌ *El bot necesita ser administrador*', m);
    if (!isAdmin) return conn.reply(m.chat, '❌ *Solo administradores pueden usar este comando*', m);

    let user;
    if (m.mentionedJid && m.mentionedJid[0]) {
        user = m.mentionedJid[0];
    } else if (m.quoted) {
        user = m.quoted.sender;
    } else {
        return conn.reply(m.chat, `❌ *Debes mencionar o responder a un mensaje*`, m);
    }

    console.log('Usuario detectado:', user);

    // ✅ OBTENER EL JID REAL (igual que el código de tagall)
    let userRealJid = user;
    let userDisplayNumber = user.split('@')[0];
    
    // Si el usuario tiene formato @lid, buscar su JID real en los participantes
    if (user.endsWith('@lid')) {
        try {
            let groupMetadata = await conn.groupMetadata(m.chat);
            let participants = groupMetadata.participants;
            
            // Buscar el participante que coincida (igual que tagall)
            let participant = participants.find(p => p.id === user);
            if (participant && participant.jid) {
                userRealJid = participant.jid; // Este es el JID real: numero@s.whatsapp.net
                userDisplayNumber = userRealJid.split('@')[0];
                console.log('JID real encontrado:', userRealJid);
            }
        } catch (error) {
            console.log('Error buscando JID real:', error);
        }
    }

    if (command === "mute") {
        if (mutedUsers.has(userRealJid)) {
            return conn.reply(m.chat, `❌ *El usuario ya está muteado* @${userDisplayNumber}`, m, { mentions: [userRealJid] });
        }
        mutedUsers.add(userRealJid);
        conn.reply(m.chat, `✅ *Usuario muteado:* @${userDisplayNumber}\n\n⚠️ *Ahora se eliminarán sus mensajes automáticamente*`, m, { mentions: [userRealJid] });
    
    } else if (command === "unmute") {
        if (!mutedUsers.has(userRealJid)) {
            return conn.reply(m.chat, `❌ *El usuario no está muteado* @${userDisplayNumber}`, m, { mentions: [userRealJid] });
        }
        mutedUsers.delete(userRealJid);
        conn.reply(m.chat, `✅ *Usuario desmuteado:* @${userDisplayNumber}`, m, { mentions: [userRealJid] });
    }
};

// ✅ Función que elimina mensajes de usuarios muteados
handler.before = async (m, { conn }) => {
    if (m.chat.endsWith('@g.us')) {
        // Verificar si el remitente está muteado (comparando con JID real)
        let isMuted = false;
        let senderJid = m.sender;
        
        // Si el sender tiene formato @lid, buscar su JID real
        if (m.sender.endsWith('@lid')) {
            try {
                let groupMetadata = await conn.groupMetadata(m.chat);
                let participants = groupMetadata.participants;
                let participant = participants.find(p => p.id === m.sender);
                if (participant && participant.jid) {
                    senderJid = participant.jid;
                }
            } catch (error) {
                console.log('Error buscando JID real del sender:', error);
            }
        }
        
        isMuted = mutedUsers.has(senderJid);
        
        if (isMuted) {
            try {
                if (m.mtype !== 'stickerMessage') {
                    await conn.sendMessage(m.chat, { delete: m.key });
                }
            } catch (e) {
                console.error('Error eliminando mensaje:', e);
            }
            return true;
        }
    }
};

handler.help = ['mute', 'unmute'];
handler.tags = ['group'];
handler.command = /^(mute|unmute)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
