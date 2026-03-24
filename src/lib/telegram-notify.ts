// Telegram notification helper
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = '5688140692';

export async function sendTelegram(text: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    console.log('Telegram bot not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
    return response.ok;
  } catch (error) {
    console.error('Telegram error:', error);
    return false;
  }
}

// Notifications
export async function notifyNewUser(username: string, name?: string) {
  return sendTelegram(`🆕 <b>Ny bruker!</b>\n\n👤 ${name || username}\n📛 @${username}`);
}

export async function notifyNewPost(username: string, content: string, postId: string) {
  const preview = content.slice(0, 100);
  return sendTelegram(`📝 <b>Ny post!</b>\n\n👤 @${username}\n💬 ${preview}...\n🔗 https://alcatelz.com/post/${postId}`);
}

export async function notifyLike(username: string, postId: string) {
  return sendTelegram(`❤️ <b>Ny like!</b>\n\n👤 @${username}\n🔗 https://alcatelz.com/post/${postId}`);
}

export async function notifyComment(username: string, postId: string, comment: string) {
  const preview = comment.slice(0, 80);
  return sendTelegram(`💬 <b>Ny kommentar!</b>\n\n👤 @${username}\n💬 ${preview}\n🔗 https://alcatelz.com/post/${postId}`);
}
