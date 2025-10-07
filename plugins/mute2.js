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
        
        console.log('Mute command detected'); // Debug
        console.log('Quoted:', m.quoted); // Debug
        console.log('Mentioned JIDs:', m.mentionedJid); // Debug
        console.log('Text:', text); // Debug
        
        // Si es respuesta a un mensaje
        if (m.quoted) {
            userId = m.quoted.sender;
            console.log('Using quoted sender:', userId); // Debug
        } 
        // Si se mencionó un usuario
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            userId = m.mentionedJid[0];
            console.log('Using mentioned JID:', userId); // Debug
        }
        // Si se proporcionó ID en el texto
        else if (text) {
            const numMatch = text.match(/\d+/g);
            if (numMatch) {
                // Tomar el último número (evita capturar el del comando)
                const num = numMatch[numMatch.length - 1];
                userId = num + '@s.whatsapp.net';
                console.log('Using number from text:', userId); // Debug
            }
        }
        
        if (!userId) {
            return m.reply('❌ *Debes responder a un mensaje, mencionar a un usuario o proporcionar su número*\n\nEjemplos:\n- .mute respondiendo a un mensaje\n- .mute @usuario\n- .mute 584123456789');
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
        
        console.log('Unmute command detected'); // Debug
        
        if (m.quoted) {
            userId = m.quoted.sender;
        } 
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            userId = m.mentionedJid[0];
        }
        else if (text) {
            const numMatch = text.match(/\d+/g);
            if (numMatch) {
                const num = numMatch[numMatch.length - 1];
                userId = num + '@s.whatsapp.net';
            }
        }
        
        if (!userId) {
            return m.reply('❌ *Debes responder a un mensaje, mencionar a un usuario o proporcionar su número*\n\nEjemplos:\n- .unmute respondiendo a un mensaje\n- .unmute @usuario\n- .unmute 584123456789');
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
