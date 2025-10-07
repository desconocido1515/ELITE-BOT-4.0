// 📁 plugins/listmute.js - Versión con base de datos global
let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        // Usar la base de datos global de Gata Bot
        let muteText = '';
        
        // 🔹 USUARIOS MUTEADOS
        let mutedUsers = global.mutedUsers || new Set();
        if (mutedUsers.size > 0) {
            muteText += `*👤 USUARIOS MUTEADOS (${mutedUsers.size})*\n`;
            
            let userCount = 1;
            for (let userJid of mutedUsers) {
                let displayNumber = userJid.split('@')[0];
                if (displayNumber.length > 10) displayNumber = displayNumber.slice(-10);
                muteText += `${userCount}. @${displayNumber}\n`;
                userCount++;
            }
            muteText += '\n';
        } else {
            muteText += `*👤 USUARIOS MUTEADOS:* 0\n\n`;
        }
        
        // 🔹 GRUPOS MUTEADOS
        let groupMuted = global.groupMuted || new Set();
        if (groupMuted.size > 0) {
            muteText += `*👥 GRUPOS MUTEADOS (${groupMuted.size})*\n`;
            
            let groupCount = 1;
            for (let groupId of groupMuted) {
                try {
                    let groupMetadata = await conn.groupMetadata(groupId);
                    let groupName = groupMetadata.subject || 'Sin nombre';
                    muteText += `${groupCount}. ${groupName}\n   👥 ${groupMetadata.participants.length} miembros\n`;
                    groupCount++;
                } catch (error) {
                    muteText += `${groupCount}. Grupo no disponible\n   🆔 ...${groupId.slice(-8)}\n`;
                    groupCount++;
                }
            }
        } else {
            muteText += `*👥 GRUPOS MUTEADOS:* 0\n`;
        }
        
        // 🔹 RESUMEN
        muteText += `\n*📊 RESUMEN:*\n`;
        muteText += `• Usuarios muteados: ${mutedUsers.size}\n`;
        muteText += `• Grupos muteados: ${groupMuted.size}\n`;
        muteText += `• Total: ${mutedUsers.size + groupMuted.size}\n`;
        
        // Menciones
        let mentions = [];
        for (let userJid of mutedUsers) {
            mentions.push(userJid);
        }
        
        await conn.sendMessage(m.chat, { 
            text: muteText, 
            mentions: mentions
        }, { quoted: m });
        
    } catch (error) {
        console.error('Error en listmute:', error);
        await conn.reply(m.chat, '❌ *Error al obtener la lista*', m);
    }
};

// Inicializar variables globales si no existen
if (!global.mutedUsers) global.mutedUsers = new Set();
if (!global.groupMuted) global.groupMuted = new Set();

handler.help = ['listmute'];
handler.tags = ['group'];
handler.command = /^(listmute|listamute|mutelist)$/i;
handler.group = true;
handler.admin = true;

export default handler;
