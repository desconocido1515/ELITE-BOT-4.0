// Comando para mutear (usando el prefijo de Gata Bot)
let commandMute = /^.*\.mute(?:\s+@?(\d+))?$/i;

// Comando para desmutear  
let commandUnmute = /^.*\.unmute(?:\s+@?(\d+))?$/i;

// Función para mutear usuario
async function muteUser(m, userId) {
    const chatId = m.chat;
    
    if (!userId) {
        return m.reply('❌ *Responde a un mensaje o menciona a un usuario*');
    }

    try {
        await bot.groupParticipantsUpdate(chatId, [userId], 'mute');
        m.reply('✅ *Usuario muteado exitosamente*');
    } catch (error) {
        m.reply('❌ *Error al mutear usuario*');
    }
}

// Función para desmutear usuario
async function unmuteUser(m, userId) {
    const chatId = m.chat;
    
    if (!userId) {
        return m.reply('❌ *Responde a un mensaje o menciona a un usuario*');
    }

    try {
        await bot.groupParticipantsUpdate(chatId, [userId], 'unmute');
        m.reply('✅ *Usuario desmuteado exitosamente*');
    } catch (error) {
        m.reply('❌ *Error al desmutear usuario*');
    }
}

// Manejador de comandos (estructura Gata Bot)
export async function before(m, { conn, text, participants }) {
    // Comando mute
    if (m.text.match(commandMute)) {
        let userId;
        
        // Si es respuesta a un mensaje
        if (m.quoted) {
            userId = m.quoted.sender;
        } 
        // Si se mencionó un usuario
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            userId = m.mentionedJid[0];
        }
        // Si se proporcionó ID
        else if (text.match(/\d+/)) {
            userId = text.match(/\d+/)[0] + '@s.whatsapp.net';
        }
        
        await muteUser(m, userId);
        return true;
    }
    
    // Comando unmute
    if (m.text.match(commandUnmute)) {
        let userId;
        
        if (m.quoted) {
            userId = m.quoted.sender;
        } 
        else if (m.mentionedJid && m.mentionedJid.length > 0) {
            userId = m.mentionedJid[0];
        }
        else if (text.match(/\d+/)) {
            userId = text.match(/\d+/)[0] + '@s.whatsapp.net';
        }
        
        await unmuteUser(m, userId);
        return true;
    }
}
