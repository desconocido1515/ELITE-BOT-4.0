import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {}

// 🔹 Escucha todos los mensajes, incluso los del sistema
handler.all = async function (m, { conn }) {
  if (!m.isGroup) return
  if (!m.messageStubType) return
  
  const chat = global.db.data.chats[m.chat]
  if (!chat?.detect) return // se puede activar con .on detect

  const participants = await conn.groupMetadata(m.chat)
  const nombreGP = participants.subject || 'este grupo'

  const sender = m.sender ? '@' + m.sender.split('@')[0] : ''
  const mentions = [m.sender]

  // Logs para ver el stub detectado
  console.log('Stub detectado:', m.messageStubType, m.messageStubParameters)

  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
      if (m.messageStubParameters[0] === 'on') {
        await conn.sendMessage(m.chat, { text: `🔒 *El grupo se ha cerrado*\nSolo los administradores pueden enviar mensajes.` })
      } else if (m.messageStubParameters[0] === 'off') {
        await conn.sendMessage(m.chat, { text: `🔓 *El grupo se ha abierto*\nAhora todos los miembros pueden enviar mensajes.` })
      }
      break

    case WAMessageStubType.GROUP_CHANGE_RESTRICT:
      if (m.messageStubParameters[0] === 'on') {
        await conn.sendMessage(m.chat, { text: `⚙️ *Los ajustes del grupo ahora solo pueden ser modificados por administradores.*` })
      } else if (m.messageStubParameters[0] === 'off') {
        await conn.sendMessage(m.chat, { text: `🔧 *Los ajustes del grupo ahora pueden ser modificados por todos los miembros.*` })
      }
      break

    case WAMessageStubType.GROUP_CHANGE_SUBJECT:
      await conn.sendMessage(m.chat, { text: `📝 *El nombre del grupo ha sido cambiado a:* ${m.messageStubParameters[0]}` })
      break

    case WAMessageStubType.GROUP_CHANGE_ICON:
      await conn.sendMessage(m.chat, { text: `🖼️ *El icono del grupo ha sido cambiado.*` })
      break

    case WAMessageStubType.GROUP_CHANGE_DESCRIPTION:
      await conn.sendMessage(m.chat, { text: `📄 *La descripción del grupo ha sido modificada.*` })
      break

    default:
      // Puedes activar esto para depurar cualquier otro stub
      // console.log('Evento no manejado:', m.messageStubType)
      break
  }
}

export default handler
