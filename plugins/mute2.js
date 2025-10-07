let handler = async (m, { conn, usedPrefix, command, text }) => {
    // Verificar que es un grupo
    if (!m.chat.endsWith('@g.us')) {
        return m.reply('❌ *Este comando solo funciona en grupos*');
    }

    // Verificar si hay mención, respuesta o texto
    if (!text && !m.mentionedJid[0] && !m.quoted) {
        return m.reply(`❌ *Debes mencionar, responder a un mensaje o proporcionar el número de un usuario*\n\nEjemplos:\n• ${usedPrefix}${command} @usuario\n• ${usedPrefix}${command} respondiendo a un mensaje\n• ${usedPrefix}${command} 584123456789`);
    }

    try {
        // ✅ Obtener el usuario real
        let user = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : text.match(/\d+/g) 
                    ? text.match(/\d+/g)[0] + '@s.whatsapp.net'
                    : false

        if (!user) {
            return m.reply('❌ *No se pudo identificar al usuario*');
        }

        console.log('Usuario detectado:', user); // Debug

        // Verificar que el usuario existe en el grupo
        let groupMetadata = await conn.groupMetadata(m.chat);
        let participants = groupMetadata.participants;
        
        console.log('Total participantes:', participants.length); // Debug
        
        // Buscar el usuario en los participantes - CORREGIDO
        let userExists = participants.find(p => {
            // Comparar tanto el JID normal como el LID
            const userWithoutSuffix = user.replace(/@s\.whatsapp\.net|@lid/, '');
            const participantId = p.id.replace(/@s\.whatsapp\.net|@lid/, '');
            return participantId === userWithoutSuffix;
        });

        console.log('Usuario encontrado:', userExists); // Debug

        if (!userExists) {
            return m.reply('❌ *El usuario no está en este grupo*');
        }

        // Obtener el JID correcto para la acción (usar el jid del participante)
        const correctJid = userExists.jid || userExists.id;

        console.log('JID a usar para la acción:', correctJid); // Debug

        // Ejecutar mute o unmute según el comando
        if (command === 'mute') {
            await conn.groupParticipantsUpdate(m.chat, [correctJid], 'mute');
            m.reply(`✅ *Usuario muteado exitosamente*\n\n👤 @${correctJid.split('@')[0]}`, null, { mentions: [correctJid] });
        
        } else if (command === 'unmute') {
            await conn.groupParticipantsUpdate(m.chat, [correctJid], 'unmute');
            m.reply(`✅ *Usuario desmuteado exitosamente*\n\n👤 @${correctJid.split('@')[0]}`, null, { mentions: [correctJid] });
        }

    } catch (error) {
        console.log('❌ Error en el comando:', error);
        
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
