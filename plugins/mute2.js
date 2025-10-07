let groupMuted = new Set();

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!m.chat.endsWith('@g.us')) {
        return conn.reply(m.chat, '❌ *Este comando solo funciona en grupos*', m);
    }
    if (!isBotAdmin) return conn.reply(m.chat, '❌ *El bot necesita ser administrador*', m);
    if (!isAdmin) return conn.reply(m.chat, '❌ *Solo administradores pueden usar este comando*', m);

    const chatId = m.chat;

    if (command === "mutegrupo") {
        if (groupMuted.has(chatId)) {
            return conn.reply(m.chat, '❌ *El grupo ya está muteado*', m);
        }
        
        groupMuted.add(chatId);
        conn.reply(m.chat, `✅ *Grupo muteado*\n\n⚠️ *Ahora solo los administradores pueden enviar mensajes*`, m);
    
    } else if (command === "unmutegrupo") {
        if (!groupMuted.has(chatId)) {
            return conn.reply(m.chat, '❌ *El grupo no está muteado*', m);
        }
        
        groupMuted.delete(chatId);
        conn.reply(m.chat, `✅ *Grupo desmuteado*\n\n🗣️ *Todos los miembros pueden enviar mensajes nuevamente*`, m);
    }
};

// ✅ Función que elimina mensajes de NO administradores cuando el grupo está muteado
handler.before = async (m, { conn }) => {
    if (m.chat.endsWith('@g.us') && groupMuted.has(m.chat)) {
        try {
            // Obtener información del grupo y participantes
            let groupMetadata = await conn.groupMetadata(m.chat);
            let participants = groupMetadata.participants;
            
            // Obtener el JID real del remitente (si es LID)
            let senderJid = m.sender;
            if (m.sender.endsWith('@lid')) {
                let participant = participants.find(p => p.id === m.sender);
                if (participant && participant.jid) {
                    senderJid = participant.jid;
                }
            }
            
            // Verificar si el remitente es administrador
            let isAdmin = false;
            let senderParticipant = participants.find(p => {
                let participantJid = p.jid ? p.jid : p.id;
                return participantJid === senderJid;
            });
            
            if (senderParticipant) {
                isAdmin = senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin';
            }
            
            console.log(`Grupo muteado - Remitente: ${senderJid}, Es admin: ${isAdmin}`);
            
            // Si NO es administrador, eliminar el mensaje
            if (!isAdmin) {
                if (m.mtype !== 'stickerMessage') {
                    await conn.sendMessage(m.chat, { delete: m.key });
                    
                    // Opcional: enviar advertencia al usuario
                    try {
                        await conn.sendMessage(m.chat, { 
                            text: `❌ *El grupo está muteado*\n\nSolo los administradores pueden enviar mensajes.\n\nUsa *${usedPrefix}unmutegrupo* para activar el chat.`,
                            mentions: [senderJid] 
                        }, { quoted: m });
                    } catch (warnError) {
                        console.log('Error enviando advertencia:', warnError);
                    }
                }
                return true; // Detener el procesamiento del mensaje
            }
            
        } catch (error) {
            console.error('Error en mute grupal:', error);
        }
    }
};

handler.help = ['mutegrupo', 'unmutegrupo'];
handler.tags = ['group'];
handler.command = /^(mutegrupo|unmutegrupo|mutegroup|unmutegroup)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
