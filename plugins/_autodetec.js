let handler = async (m) => {}
handler.all = async function (m) {
  if (!m.isGroup) return
  if (!m.messageStubType) return
  if (m.messageStubType === 2) return // ignorar mensajes cifrados

  const conn = global.conn
  const chat = global.db.data.chats[m.chat]
  if (!conn || !chat?.detect) return

  const usuario = '@' + m.sender.split('@')[0]
  const stub = m.messageStubType
  const param = m.messageStubParameters?.[0] || ''

  console.log('📡 Evento detectado:', { stub, param })

  let texto

  // Aquí ponemos los stubs según lo que salga en tu consola
  switch (stub) {
    case 26: // abrir/cerrar grupo
      texto = param === 'on'
        ? `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${usuario}\n» 𝗖𝗘𝗥𝗥𝗢́ 𝗘𝗟 𝗚𝗥𝗨𝗣𝗢.\n\n> 💬 Solo los administradores pueden enviar mensajes.`
        : `❱❱ 𝗢́𝗥𝗗𝗘𝗡𝗘𝗦 𝗥𝗘𝗖𝗜𝗕𝗜𝗗𝗔𝗦 ❰❰\n\n👤 ${usuario}\n» 𝗔𝗕𝗥𝗜𝗢́ 𝗘𝗟 𝗚𝗥𝗨𝗣𝗢.\n\n> 💬 Todos los miembros pueden enviar mensajes.`
      break

    case 31: // cambio de nombre (ajusta al número que tu consola muestre)
      texto = `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${param}_`
      break

    case 32: // cambio de icono
      texto = `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`
      break

    case 33: // cambio de descripción
      texto = `📝 ${usuario} ha cambiado la descripción del grupo.\n\n> 🔹 Nueva descripción: _${param}_`
      break

    case 34: // restrict edit group
      texto = param === 'on'
        ? `⚙️ ${usuario} ha restringido los ajustes del grupo.\n\n> 🔒 Solo los administradores pueden editar la info del grupo.`
        : `⚙️ ${usuario} ha permitido que todos editen los ajustes del grupo.`
      break

    case 174: // promote
      texto = `👑 @${param.split('@')[0]} ahora es administrador.\n\n> Acción realizada por ${usuario}`
      break

    case 175: // demote
      texto = `❌ @${param.split('@')[0]} ya no es administrador.\n\n> Acción realizada por ${usuario}`
      break

    default:
      console.log('Stub no manejado:', stub, param)
      return
  }

  // Enviar mensaje si se definió texto
  if (texto) {
    try {
      await conn.sendMessage(m.chat, { text: texto, mentions: [m.sender] })
    } catch (e) {
      console.error('Error enviando mensaje de stub:', e)
    }
  }
}

export default handler
