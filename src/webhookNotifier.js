const axios = require('axios');

const sendWebhookNotification = async (webhookUrl, embedContent) => {
    try {
        // Check if embedContent is an array (multiple embeds) or a single embed object
        const embeds = Array.isArray(embedContent) ? embedContent : [embedContent];

        await axios.post(webhookUrl, {
            embeds: embeds,
        });
        console.log('Notification sent to Discord!');
    } catch (error) {
        console.error('Error sending Discord notification', error.response?.data || error.message);
    }
};

module.exports = { sendWebhookNotification };