const formatWebhookEmbed = (changes, account) => {
    if (!changes || changes.length === 0) {
        return null;
    }

    const formatUserLink = (userId) => `[${userId}](https://www.roblox.com/users/${userId}/profile)`;

    const formatGameLink = (placeId) => `[${placeId}](https://www.roblox.com/games/${placeId})`;

    // Handle Friend List Changes
    const friendChanges = changes.find(change => change.field === "friendListData.friends");

    const friendDetails = friendChanges
        ? `**Friend List Changes:**\nNew Friends: ${
            friendChanges.details.additions.length > 0
                ? friendChanges.details.additions.map(f => formatUserLink(f.id)).join(", ")
                : "None"
        }\nRemoved Friends: ${
            friendChanges.details.deletions.length > 0
                ? friendChanges.details.deletions.map(f => formatUserLink(f.id)).join(", ")
                : "None"
        }`
        : "";

    // Map and parse changes into a readable description
    const changeSummary = changes
        .map(change => {
            if (change.field === "friendListData.friends") {
                return friendDetails;
            } else if (change.field.includes("placeId") || change.field.includes("rootPlaceId")) {
                // If the field involves a Place ID, convert it to a game link
                return `**Field:** \`${change.field}\`\n**Before:** ${
                    change.oldValue ? formatGameLink(change.oldValue) : "N/A"
                }\n**After:** ${
                    change.newValue ? formatGameLink(change.newValue) : "N/A"
                }`;
            } else if (change.field.includes("userId")) {
                // If the field involves a User ID, convert it to a profile link
                return `**Field:** \`${change.field}\`\n**Before:** ${
                    change.oldValue ? formatUserLink(change.oldValue) : "N/A"
                }\n**After:** ${
                    change.newValue ? formatUserLink(change.newValue) : "N/A"
                }`;
            }

            // Default formatting for other fields
            return `**Field:** \`${change.field}\`\n**Before:** ${change.oldValue}\n**After:** ${change.newValue}`;
        })
        .join("\n\n");

    // Return the embed object for the webhook
    return {
        title: `Changes detected for Roblox account (${account.accountId})`,
        color: 0x3498db,
        description: `**Changed Fields:**\n\n${changeSummary}`,
        timestamp: new Date().toISOString(),
    };
};

module.exports = { formatWebhookEmbed };