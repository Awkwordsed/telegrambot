require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { getFreePromotions } = require('steam-free-promotions');

// Load the bot token, group chat ID, and topic ID from the .env file
const token = process.env.TELEGRAM_BOT_TOKEN;
const groupChatId = process.env.TELEGRAM_GROUP_CHAT_ID;
const topicId = process.env.TELEGRAM_TOPIC_ID;
const bot = new TelegramBot(token, { polling: true });

// Function to fetch and sort games
async function fetchAndSortGames() {
  try {
    const games = await getFreePromotions();
    // Map the games to only include name and link
    const simplifiedGames = games.map(game => ({
      name: game.name,
      link: game.link
    }));
    // Sort games by name
    simplifiedGames.sort((a, b) => a.name.localeCompare(b.name));
    return simplifiedGames;
  } catch (error) {
    console.error('Error fetching and sorting games:', error);
    throw error;
  }
}

// Function to send games to the specified topic in the group chat
async function sendGamesToTopic(games) {
  try {
    games.forEach((game, index) => {
      const message = `${index + 1}. ${game.name}\nLink: ${game.link}`;
      bot.sendMessage(groupChatId, message, { message_thread_id: topicId });
    });
  } catch (error) {
    console.error('Error sending games to the topic:', error);
  }
}

// Command handler for /freepromotion
bot.onText(/\/freepromotion/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const sortedGames = await fetchAndSortGames();

    // Send the sorted games to the user
    sortedGames.forEach((game, index) => {
      bot.sendMessage(chatId, `${index + 1}. ${game.name}\nLink: ${game.link}`);
    });

    // Send the sorted games to the specified topic in the group chat
    await sendGamesToTopic(sortedGames);
  } catch (error) {
    bot.sendMessage(chatId, 'An error occurred while fetching and sorting the games.');
  }
});

// Start the bot
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});
