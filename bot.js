const jalaali = require('jalaali-js');

const TelegramBot = require('node-telegram-bot-api');
const token = '7992454375:AAFCkw_3XYP1_sSrd8ou0Fz4aIoZq0D9yGg';
const bot = new TelegramBot(token, {polling: true});

const cache = {};

const getInfo = (msg) => {
  const today = new Date();
  const jalaliDate = jalaali.toJalaali(today);
  const days = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', '‍‍‍‍‍‍پنج شنبه', 'جمعه', 'شنبه'];
  const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  return `Today's date: ${days[today.getDay()]}, ${months[jalaliDate.jm]} ${jalaliDate.jd}, ${jalaliDate.jy}`;
};

const getWeather = async (msg) => {
  let endpoint = 'http://wttr.in/ardabil?format=3';
  const response = await fetch(endpoint, { method: 'GET' });
  const data = await response.text();
  return `${data}`;
};

const main = async (msg) => {
  const cacheKey = 'today'; // use a fixed cache key for this example
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  const resultOne = getInfo();
  const resultTwo = await getWeather();
  const allResult = resultOne + "\n" + resultTwo;
  cache[cacheKey] = allResult; // cache the result
  return allResult;
};


// bot.on('message', (msg) => {
//   if (msg.text === '/start') {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Welcome');
//   }
// });

bot.on('message', (msg) => {
  if (msg.text === '/today') {
    main(msg).then((result) => {
      bot.sendMessage(msg.chat.id, result);
    });
  }
});
