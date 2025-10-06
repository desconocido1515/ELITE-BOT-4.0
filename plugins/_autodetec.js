import fetch from 'node-fetch'

let handler = async (m) => {}
handler.all = async function (m) {
  if (!m.isGroup) return
  if (!m.messageStubType) return

  const conn = global.conn
  if (!conn) return

  const chat = global.db.data.chats[m.chat]
  if (!chat?.detect) return

  const usuario = '@' + m.sender.split('@')[0]

  // Log para ver el stub
  console.log('📡 Evento detectado:', {
    messageStubType: m.messageStubType,
    messageStubParameters: m.messageStubParameters
  })

  try {
    switch (m.messageStubType) {
      case 21: // cambio de nombre
        await conn.sendMessage(m.chat, {
          text: `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters?.[0] || ''}_`,
          mentions: [m.sender]
        })
        break

      case 22: // cambio de icono
        await conn.sendMessage(m.chat, {
          text: `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`,
          mentions: [m.sender]
        })
        break

      case 26: // grupo cerrado/abierto (ANNOUNCE)
        if (m.messageStubParameters?.[0] === 'on') {
          await conn.sendMessage(m.chat, {
            text: `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${usuario}\n» 𝗖𝗘𝗥𝗥𝗢́ 𝗘𝗟 𝗚𝗥𝗨𝗣𝗢.\n\n> 💬 Ahora *solo los administradores* pueden enviar mensajes.`,
            mentions: [m.sender]
          })
        } else {
          await conn.sendMessage(m.chat, {
            text: `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${usuario}\n» 𝗔𝗕𝗥𝗜𝗢́ 𝗘𝗟 𝗚𝗥𝗨𝗣𝗢.\n\n> 💬 Ahora *todos los miembros* pueden enviar mensajes.`,
            mentions: [m.sender]
          })
        }
        break

      case 25: // restrict (solo admin pueden editar info)
        if (m.messageStubParameters?.[0] === 'on') {
          await conn.sendMessage(m.chat, {
            text: `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *solo los administradores* pueden editar la info del grupo.`,
            mentions: [m.sender]
          })
        } else {
          await conn.sendMessage(m.chat, {
            text: `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔓 Ahora *todos los miembros* pueden editar la info del grupo.`,
            mentions: [m.sender]
          })
        }
        break

      case 29: // cambio de descripción
        await conn.sendMessage(m.chat, {
          text: `📝 ${usuario} ha cambiado la descripción del grupo.\n\n> 🔹 Nueva descripción: _${m.messageStubParameters?.[0] || ''}_`,
          mentions: [m.sender]
        })
        break

      case 172: // promote
        await conn.sendMessage(m.chat, {
          text: `❱❱ 𝙁𝙀𝙇𝙄𝘾𝙄𝘿𝘼𝘿𝙀𝙎 ❰❰\n\n👤 @${m.messageStubParameters?.[0]?.split('@')[0]}\n» 𝘼𝙃𝙊𝙍𝘼 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`,
          mentions: [m.sender]
        })
        break

      case 173: // demote
        await conn.sendMessage(m.chat, {
          text: `❱❱ 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝘾𝙄𝙊́𝙉 ❰❰\n\n👤 @${m.messageStubParameters?.[0]?.split('@')[0]}\n» 𝙔𝘼 𝙉𝙊 𝙀𝙎 𝘼𝘿𝙈𝙄𝙉.\n\n» 𝘼𝘾𝘾𝙄𝙊́𝙉 𝙍𝙀𝘼𝙇𝙄𝙕𝘼𝘿𝘼 𝙋𝙊𝙍:\n${usuario}`,
          mentions: [m.sender]
        })
        break

      default:
        // solo log
        console.log('Stub no manejado:', m.messageStubType)
        break
    }
  } catch (err) {
    console.error('Error en autodetector:', err)
  }
}

export default handler
