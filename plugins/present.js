import fs from 'fs'

let handler = async (m, { conn }) => {}
export default handler

// Detectar cuando el bot es agregado a un grupo
handler.groupUpdate = async function (update) {
  try {
    const { id, participants, action } = update
    const botJid = this.user.jid || this.decodeJid(this.user.id)

    // Verifica si el bot fue agregado
    if (action === 'add' && participants.includes(botJid)) {
      let botName = this.user.name
      let audioPath = './Audios/presentacion1.mp3'

      let welcomeBotText = `🥇 ¡𝗛𝗢𝗟𝗔 𝗚𝗥𝗨𝗣𝗢!🥇  
¡Soy ${botName}, su nuevo asistente digital!  
━━━━━━━━━━━━━━━━━━━  
⚡ *Mis funciones :*  
▸ Descargar música/videos  
▸ Búsquedas en Google  
▸ Juegos y diversión  
▸ Generar imágenes con IA  
▸ Herramientas para Free Fire  
━━━━━━━━━━━━━━━━━━━  
📂 *Mis menús:*  
▸ .menu → *Menú general*  
▸ .menuimg → *Imágenes AI*  
▸ .menuhot → *Contenido hot*  
▸ .menuaudios → *Efectos*  
▸ .menujuegos → *Juegos grupales*  
▸ .menufreefire → *Free Fire tools*  
━━━━━━━━━━━━━━━━━━━  
©EliteBotGlobal 2023`

      await this.sendMessage(id, { text: welcomeBotText })
      await this.sendMessage(id, {
        audio: { url: audioPath },
        mimetype: 'audio/mpeg',
        ptt: true
      })
    }
  } catch (err) {
    console.error('Error al detectar ingreso del bot:', err)
  }
}
