let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Verificar que es un grupo
    if (!m.chat.endsWith('@g.us')) {
        return m.reply('❌ *Este comando solo funciona en grupos*');
    }

    // Verificar si hay mención, respuesta o texto (igual que tu comando follar)
    if (!text && !m.mentionedJid[0] && !m.quoted) {
        return m.reply(`❌ *Debes mencionar, responder a un mensaje o proporcionar el número de un usuario*`);
    }

    try {
        // ✅ Obtener el usuario real (EXACTAMENTE igual que tu comando follar)
        let user = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : false

        if (!user) {
            return m.reply('❌ *No se pudo identificar al usuario*');
        }

        console.log('Usuario a procesar:', user);

        // Intentar la acción directamente con el user detectado
        try {
            if (command === 'mute') {
                await conn.groupParticipantsUpdate(m.chat, [user], 'mute');
                m.reply(`✅ *Usuario muteado exitosamente*\n\n👤 @${user.split('@')[0]}`, null, { mentions: [user] });
            } else if (command === 'unmute') {
                await conn.groupParticipantsUpdate(m.chat, [user], 'unmute');
                m.reply(`✅ *Usuario desmuteado exitosamente*\n\n👤 @${user.split('@')[0]}`, null, { mentions: [user] });
            }
        } catch (actionError) {
            console.log('Error en la acción:', actionError);
            
            // Si falla con el user original, intentar obtener el jid real
            let groupMetadata = await conn.groupMetadata(m.chat);
            let participants = groupMetadata.participants;
            
            // Buscar el participante que coincida
            let participant = participants.find(p => p.id === user);
            if (participant && participant.jid) {
                console.log('Intentando con JID real:', participant.jid);
                
                if (command === 'mute') {
                    await conn.groupParticipantsUpdate(m.chat, [participant.jid], 'mute');
                    m.reply(`✅ *Usuario muteado exitosamente*\n\n👤 @${participant.jid.split('@')[0]}`, null, { mentions: [participant.jid] });
                } else if (command === 'unmute') {
                    await conn.groupParticipantsUpdate(m.chat, [participant.jid], 'unmute');
                    m.reply(`✅ *Usuario desmuteado exitosamente*\n\n👤 @${participant.jid.split('@')[0]}`, null, { mentions: [participant.jid] });
                }
            } else {
                throw actionError;
            }
        }

    } catch (error) {
        console.log('❌ Error final en el comando:', error);
        
        if (error.message.includes('403')) {
            m.reply('❌ *No tengo permisos de administrador para mutear/desmutear*');
        } else if (error.message.includes('401')) {
            m.reply('❌ *El usuario ya tiene ese estado*');
        } else if (error.message.includes('404') || error.message.includes('not found')) {
            m.reply('❌ *El usuario no se encuentra en el grupo*');
        } else {
            m.reply(`❌ *Error al ejecutar el comando:* ${error.message}`);
        }
    }
}

// Registrar ambos comandos
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
export default handler
