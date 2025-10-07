// Comando para mutear un usuario
let commandMute = /^\.mute(?:\s+@?(\d+))?$/i;

async function muteUser(userId, chatId) {
    try {
        // Restringir permisos del usuario
        await bot.restrictChatMember(chatId, userId, {
            can_send_messages: false,
            can_send_media_messages: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false
        });
        
        return `✅ Usuario muteado exitosamente`;
    } catch (error) {
        return `❌ Error al mutear usuario: ${error.message}`;
    }
}

// Comando para desmutear un usuario
let commandUnmute = /^\.unmute(?:\s+@?(\d+))?$/i;

async function unmuteUser(userId, chatId) {
    try {
        // Restaurar permisos del usuario
        await bot.restrictChatMember(chatId, userId, {
            can_send_messages: true,
            can_send_media_messages: true,
            can_send_other_messages: true,
            can_add_web_page_previews: true
        });
        
        return `✅ Usuario desmuteado exitosamente`;
    } catch (error) {
        return `❌ Error al desmutear usuario: ${error.message}`;
    }
}

// Manejador del comando mute
bot.onText(commandMute, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1] || msg.reply_to_message?.from?.id;

    if (!userId) {
        return bot.sendMessage(chatId, "❌ Debes responder al mensaje del usuario o proporcionar su ID");
    }

    const result = await muteUser(userId, chatId);
    bot.sendMessage(chatId, result);
});

// Manejador del comando unmute
bot.onText(commandUnmute, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = match[1] || msg.reply_to_message?.from?.id;

    if (!userId) {
        return bot.sendMessage(chatId, "❌ Debes responder al mensaje del usuario o proporcionar su ID");
    }

    const result = await unmuteUser(userId, chatId);
    bot.sendMessage(chatId, result);
});
