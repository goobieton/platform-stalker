const axios = require('axios');

const RobloxData = async (cookie, userId) => {
    const url = `https://users.roblox.com/v1/users/${userId}`;

    try {
        const response = await axios.get(url, {
            headers: {
                Cookie: `${cookie};`,
            },
        });

        return response.data;
    } catch (error) {
        console.error(`Error fetching Roblox data for user ${userId}:`, error.message);
        throw error;
    }
};

const RobloxPresence = async (cookie, userIds) => {
    const url = `https://presence.roblox.com/v1/presence/users`;

    const payload = {
        userIds,
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                Cookie: `${cookie}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Presence data fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching presence data:', {
            message: error.message,
            ...(error.response && {
                status: error.response.status,
                data: error.response.data,
            }),
        });

        throw new Error(
            `Failed to fetch presence data. Status: ${error.response?.status}. Details: ${error.response?.data?.errors || error.message}`
        );
    }
};

module.exports = { RobloxData, RobloxPresence };