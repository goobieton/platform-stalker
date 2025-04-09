const formatWebhookEmbed = (changes, account) => {
    if (!changes || changes.length === 0) {
        return null;
    }

    const changeSummary = changes
        .map((change) => {
            const [parent, child] = change.field.split(".");

            return `**Field:** \`${parent}.${child}\`\n**Before:** ${typeof change.oldValue === "string" ? `\`${change.oldValue}\`` : change.oldValue}\n**After:** ${typeof change.newValue === "string" ? `\`${change.newValue}\`` : change.newValue}`;
        })
        .join("\n\n");

    return {
        title: `Changes detected for Roblox account (${account.accountId})`,
        color: 0x3498db,
        description: `**Changed Fields:**\n\n${changeSummary}`,
        timestamp: new Date().toISOString(),
    };
};

module.exports = { formatWebhookEmbed };