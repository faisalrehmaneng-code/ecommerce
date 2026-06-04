const axios = require('axios');

const sendAdminNotification = async text => {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.MY_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return console.log('Telegram credentials missing in .env');
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      },
      {
        timeout: 3000 
      }
    );
    console.log('✅ Telegram notification sent!');
  } catch (error) {
    console.error('❌ Telegram Blocked/Timeout:', error.message);
  }
};

module.exports = sendAdminNotification;
