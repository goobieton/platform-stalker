const axios = require('axios');

const sendWebhookNotification = async (webhookUrl, embed) => {
    try {
        await axios.post(webhookUrl, {
            embeds: [embed],
        });
        console.log('Notification sent to Discord!');
    } catch (error) {
        console.error('Error sending Discord notification:', error.response?.data || error.message);
    }
};

module.exports = { sendWebhookNotification };