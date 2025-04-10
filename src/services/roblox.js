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

        return response.data;
    } catch (error) {
        throw new Error(
            `Failed to fetch presence data. Status: ${error.response?.status}. Details: ${error.response?.data?.errors || error.message}`
        );
    }
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const RobloxFriends = async (cookie, userId) => {
    const url = `https://friends.roblox.com/v1/users/${userId}/friends/find`;
    let friendsList = [];
    let nextCursor = null;

    try {
        do {
            const paginatedUrl = nextCursor
                ? `${url}?cursor=${encodeURIComponent(nextCursor)}`
                : url;

            const response = await axios.get(paginatedUrl, {
                headers: {
                    Cookie: `${cookie};`,
                },
            });

            const { PageItems, NextCursor } = response.data;

            if (PageItems) {
                friendsList = friendsList.concat(PageItems);
            }
            nextCursor = NextCursor;

            if (nextCursor) {
                await delay(1000);
            }
        } while (nextCursor);
    } catch (error) {
        throw error;
    }

    return friendsList;
};

module.exports = { RobloxData, RobloxPresence, RobloxFriends };