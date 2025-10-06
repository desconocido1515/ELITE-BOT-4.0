import fetch from 'node-fetch'
import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = async (m) => {}

handler.all = async function (m) {
  // Evitar procesar mensajes fuera de grupos o sin evento del sistema
  if (!m.isGroup) return
  if (!m.messageStubType) return

  // Obtener conexión global (para GataBot)
  const conn = global.conn
  if (!conn) return

  // Verificar si el detector está activado
  const chat = global.db.data.chats[m.chat]
  if (!chat?.detect) return

  // Intentar obtener metadatos del grupo
  let groupMetadata
  try {
    groupMetadata = await conn.groupMetadata(m.chat)
  } catch {
    groupMetadata = { subject: 'este grupo' }
  }

  const nombreGP = groupMetadata.subject || 'este grupo'

  // Log en consola para confirmar el stub detectado
  console.log('Stub detectado:', m.messageStubType, m.messageStubParameters)

  switch (m.messageStubType) {
    case WAMessageStubType.GROUP_CHANGE_ANNOUNCE:
      if (m.messageStubParameters[0] === 'on') {
        await conn.sendMessage(m.chat, {
          text: `🔒 *El grupo se ha cerrado*\nSolo los administradores pueden enviar mensajes.`,
        })
      } else if (m.messageStubParameters[0] === 'off') {
        await conn.sendMessage(m.chat, {
          text: `🔓 *El grupo se ha abierto*\nAhora todos los miembros pueden enviar mensajes.`,
        })
      }
      break

    case WAMessageStubType.GROUP_CHANGE_RESTRICT:
      if (m.messageStubParameters[0] === 'on') {
        await conn.sendMessage(m.chat, {
          text: `⚙️ *Los ajustes del grupo ahora solo pueden ser modificados por administradores.*`,
        })
      } else if (m.messageStubParameters[0] === 'off') {
        await conn.sendMessage(m.chat, {
          text: `🔧 *Los ajustes del grupo ahora pueden ser modificados por todos los miembros.*`,
        })
      }
      break

    case WAMessageStubType.GROUP_CHANGE_SUBJECT:
      await conn.sendMessage(m.chat, {
        text: `📝 *El nombre del grupo ha sido cambiado a:* ${m.messageStubParameters[0]}`,
      })
      break

    case WAMessageStubType.GROUP_CHANGE_ICON:
      await conn.sendMessage(m.chat, {
        text: `🖼️ *El icono del grupo ha sido cambiado.*`,
      })
      break

    case WAMessageStubType.GROUP_CHANGE_DESCRIPTION:
      await conn.sendMessage(m.chat, {
        text: `📄 *La descripción del grupo ha sido modificada.*`,
      })
      break
  }
}

export default handler
