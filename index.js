const WEBHOOK = '/webhook'
const SECRET = 'arival-secret-2026'  // change to a random string

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    
    if (url.pathname === WEBHOOK) {
      return handleWebhook(request, env)
    }
    if (url.pathname === '/register') {
      return registerWebhook(request, env)
    }
    return new Response('👋 Arival Worker ready')
  }
}

async function handleWebhook(request, env) {
  if (request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== SECRET) {
    return new Response('Unauthorized', { status: 403 })
  }

  const update = await request.json()
  if (update.message) {
    await onMessage(update.message, env)
  }
  return new Response('OK')
}

async function onMessage(msg, env) {
  const chatId = msg.chat.id
  const text = (msg.text || '').toLowerCase()
  let reply = "Hi, I'm Ara 👋 What can I help you with?"

  if (text.includes('hi') || text.includes('start')) reply = "Hey there! Welcome to Arival."
  else if (text.includes('what') || text.includes('arival')) reply = "Arival helps you get things done faster with AI."
  else if (text.includes('price') || text.includes('pricing')) reply = "Plans start at $9/month. See https://arivalse.pro/pricing"
  else if (text.includes('how') || text.includes('work')) reply = "You talk to me here — I take care of the rest."
  else if (text.includes('email') || text.includes('contact')) reply = "Drop us an email at hello@arivalse.pro"

  await sendMessage(chatId, reply, env.BOT_TOKEN)
}

async function sendMessage(chatId, text, token) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  })
}

async function registerWebhook(request, env) {
  const workerUrl = new URL(request.url)
  const webhookUrl = `${workerUrl.protocol}//${workerUrl.host}${WEBHOOK}`
  
  const res = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: SECRET
    })
  })
  
  const data = await res.json()
  return new Response(JSON.stringify(data, null, 2))
}
