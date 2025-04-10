const formatRobloxWebhook = (changes, account) => {
    if (!changes || changes.length === 0) {
        return null;
    }

    const formatUserLink = (userId) => `[${userId}](https://www.roblox.com/users/${userId}/profile)`;
    const formatGameLink = (placeId) => `[${placeId}](https://www.roblox.com/games/${placeId})`;

    // Add function to convert userPresenceType to readable status
    const getUserPresenceStatus = (type) => {
        switch (parseInt(type)) {
            case 0: return "Offline";
            case 1: return "Website";
            case 2: return "Playing game";
            default: return "Unknown";
        }
    };

    // Group changes by parent category
    const categorizedChanges = {
        userData: [],
        presenceData: [],
        friendListData: []
    };

    // Categorize each change based on its field prefix
    changes.forEach(change => {
        if (change.field.startsWith('userData.')) {
            categorizedChanges.userData.push(change);
        } else if (change.field.startsWith('presenceData.')) {
            categorizedChanges.presenceData.push(change);
        } else if (change.field.startsWith('friendListData.')) {
            categorizedChanges.friendListData.push(change);
        }
    });

    // Format the friend list changes, but only show relevant parts
    const friendChanges = changes.find(change => change.field === "friendListData.friends");
    let friendDetails = "";

    if (friendChanges) {
        friendDetails = "**Friend List Changes:**";

        // Only show New Friends section if there are additions
        if (friendChanges.details.additions.length > 0) {
            const newFriends = friendChanges.details.additions.map(f => formatUserLink(f.id)).join(", ");
            friendDetails += `\nNew Friends: ${newFriends}`;
        }

        // Only show Removed Friends section if there are deletions
        if (friendChanges.details.deletions.length > 0) {
            const removedFriends = friendChanges.details.deletions.map(f => formatUserLink(f.id)).join(", ");
            friendDetails += `\nRemoved Friends: ${removedFriends}`;
        }
    }

    // Format changes for each category
    const formatChangeCategory = (changeList) => {
        // For presenceData, we'll format it specially
        if (changeList.length > 0 && changeList[0].field.startsWith('presenceData.')) {
            const presenceChanges = {};

            // Collect all presence data changes
            changeList.forEach(change => {
                const field = change.field.replace('presenceData.', '');
                presenceChanges[field] = {
                    oldValue: change.oldValue,
                    newValue: change.newValue
                };
            });

            // Format the presence data nicely
            let formattedPresence = "";

            // If userPresenceType changed, show it with human-readable status
            if (presenceChanges.userPresenceType) {
                const oldStatus = getUserPresenceStatus(presenceChanges.userPresenceType.oldValue);
                const newStatus = getUserPresenceStatus(presenceChanges.userPresenceType.newValue);
                formattedPresence += `**Status:** ${oldStatus} → ${newStatus}\n\n`;
            }

            // Only show lastLocation if userPresenceType is 2 (Playing Game)
            if (presenceChanges.lastLocation && presenceChanges.userPresenceType &&
                (presenceChanges.userPresenceType.newValue === 2 || presenceChanges.userPresenceType.newValue === "2")) {
                formattedPresence += `**Playing:** ${presenceChanges.lastLocation.newValue}\n\n`;
            }

            // Include placeId if it exists, but format it as a link
            if (presenceChanges.placeId) {
                formattedPresence += `**Game:** ${
                    presenceChanges.placeId.oldValue ? formatGameLink(presenceChanges.placeId.oldValue) : "N/A"
                } → ${
                    presenceChanges.placeId.newValue ? formatGameLink(presenceChanges.placeId.newValue) : "N/A"
                }\n\n`;
            }

            return formattedPresence || "No relevant presence changes";
        }

        // For other change types, use the existing code
        return changeList.map(change => {
            if (change.field === "friendListData.friends") {
                return friendDetails;
            } else if (change.field.includes("placeId") || change.field.includes("rootPlaceId")) {
                return `**Field:** \`${change.field}\`\n**Change:** ${
                    change.oldValue ? formatGameLink(change.oldValue) : "N/A"
                } → ${
                    change.newValue ? formatGameLink(change.newValue) : "N/A"
                }`;
            } else if (change.field.includes("userId")) {
                return `**Field:** \`${change.field}\`\n**Change:** ${
                    change.oldValue ? formatUserLink(change.oldValue) : "N/A"
                } → ${
                    change.newValue ? formatUserLink(change.newValue) : "N/A"
                }`;
            }
            return `**Field:** \`${change.field}\`\n**Change:** ${change.oldValue} → ${change.newValue}`;
        }).join("\n\n");
    };

    // Create embeds for each category that has changes
    const embeds = [];

    if (categorizedChanges.userData.length > 0) {
        embeds.push({
            title: `User Data Changes (${account.accountId})`,
            color: 0xe41e05, // Different color for user data
            description: formatChangeCategory(categorizedChanges.userData),
            timestamp: new Date().toISOString(),
        });
    }

    if (categorizedChanges.presenceData.length > 0) {
        embeds.push({
            title: `Presence Data Changes (${account.accountId})`,
            color: 0x02b757, // Different color for presence data
            description: formatChangeCategory(categorizedChanges.presenceData),
            timestamp: new Date().toISOString(),
        });
    }

    if (categorizedChanges.friendListData.length > 0) {
        embeds.push({
            title: `Friend List Changes (${account.accountId})`,
            color: 0x00a2ff, // Different color for friend list data
            description: formatChangeCategory(categorizedChanges.friendListData),
            timestamp: new Date().toISOString(),
        });
    }
    console.log(embeds);
    return embeds;
};

module.exports = formatRobloxWebhook;