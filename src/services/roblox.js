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

// Utility function to add delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const RobloxFriends = async (cookie, userId) => {
    const url = `https://friends.roblox.com/v1/users/${userId}/friends/find`;
    let friendsList = [];
    let nextCursor = null;

    try {
        do {
            // Add the NextCursor as query params if it exists
            const paginatedUrl = nextCursor
                ? `${url}?cursor=${encodeURIComponent(nextCursor)}`
                : url;

            const response = await axios.get(paginatedUrl, {
                headers: {
                    Cookie: `${cookie};`,
                },
            });

            // Combine PageItems to the list of friends
            const { PageItems, NextCursor } = response.data;

            if (PageItems) {
                friendsList = friendsList.concat(PageItems);
            }
            nextCursor = NextCursor;

            // Add a delay of 1 second (or adjust to your needs) between page requests
            if (nextCursor) {
                console.log(`Next page detected. Fetching next page after delay...`);
                await delay(1000); // 1000ms to reduce API spam
            }
        } while (nextCursor); // Keep fetching while there are more pages

        console.log(`Successfully retrieved ${friendsList.length} friends.`);
    } catch (error) {
        console.error(`Error fetching friend list for user ${userId}:`, error.message);
        throw error;
    }

    return friendsList; // An array of all friends
};

module.exports = { RobloxData, RobloxPresence, RobloxFriends };