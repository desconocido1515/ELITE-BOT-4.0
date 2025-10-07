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
        // ✅ Obtener el usuario real (misma estructura que tu código)
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

        // Verificar que el usuario existe en el grupo
        let groupMetadata = await conn.groupMetadata(m.chat);
        let participants = groupMetadata.participants;
        let userExists = participants.find(p => p.id === user);
        
        if (!userExists) {
            return m.reply('❌ *El usuario no está en este grupo*');
        }

        // Ejecutar mute o unmute según el comando
        if (command === 'mute') {
            await conn.groupParticipantsUpdate(m.chat, [user], 'mute');
            m.reply(`✅ *Usuario muteado exitosamente*\n\n👤 @${user.split('@')[0]}`, null, { mentions: [user] });
        
        } else if (command === 'unmute') {
            await conn.groupParticipantsUpdate(m.chat, [user], 'unmute');
            m.reply(`✅ *Usuario desmuteado exitosamente*\n\n👤 @${user.split('@')[0]}`, null, { mentions: [user] });
        }

    } catch (error) {
        console.log('❌ Error en el comando:', error);
        
        if (error.message.includes('403')) {
            m.reply('❌ *No tengo permisos de administrador para mutear/desmutear*');
        } else if (error.message.includes('401')) {
            m.reply('❌ *El usuario ya tiene ese estado*');
        } else {
            m.reply('❌ *Error al ejecutar el comando*');
        }
    }
}

// Registrar ambos comandos
handler.command = /^(mute|unmute)$/i
handler.group = true
handler.botAdmin = true
handler.admin = true
export default handler
