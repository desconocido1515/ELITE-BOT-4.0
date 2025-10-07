// Comando para mutear y desmutear en Gata Bot-MD
let commandMute = /^[!\/#\.]mute(?:\s+@?(\d+))?$/i;
let commandUnmute = /^[!\/#\.]unmute(?:\s+@?(\d+))?$/i;

export async function before(m, { conn, text, participants }) {
    // Verificar si el mensaje tiene contenido y es en grupo
    if (!m.message || !m.chat.endsWith('@g.us')) return;

    const messageText = m.text || '';
    
    // Comando MUTE
    if (commandMute.test(messageText)) {
        let userId;
        
        // Si es respuesta a un mensaje
        if (m.quoted) {
            userId = m.quoted.sender;
        } 
        // Si se mencionó un usuario
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            userId = m.mentionedJid[0];
        }
        // Si se proporcionó ID en el texto
        else if (text) {
            const numMatch = text.match(/\d+/);
            if (numMatch) {
                userId = numMatch[0] + '@s.whatsapp.net';
            }
        }
        
        if (!userId) {
            return m.reply('❌ *Debes responder a un mensaje, mencionar a un usuario o proporcionar su número*');
        }

        try {
            await conn.groupParticipantsUpdate(m.chat, [userId], 'mute');
            m.reply('✅ *Usuario muteado exitosamente*');
        } catch (error) {
            console.log(error);
            m.reply('❌ *Error al mutear usuario. Verifica que soy administrador*');
        }
        return true;
    }
    
    // Comando UNMUTE
    if (commandUnmute.test(messageText)) {
        let userId;
        
        if (m.quoted) {
            userId = m.quoted.sender;
        } 
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            userId = m.mentionedJid[0];
        }
        else if (text) {
            const numMatch = text.match(/\d+/);
            if (numMatch) {
                userId = numMatch[0] + '@s.whatsapp.net';
            }
        }
        
        if (!userId) {
            return m.reply('❌ *Debes responder a un mensaje, mencionar a un usuario o proporcionar su número*');
        }

        try {
            await conn.groupParticipantsUpdate(m.chat, [userId], 'unmute');
            m.reply('✅ *Usuario desmuteado exitosamente*');
        } catch (error) {
            console.log(error);
            m.reply('❌ *Error al desmutear usuario. Verifica que soy administrador*');
        }
        return true;
    }
}
