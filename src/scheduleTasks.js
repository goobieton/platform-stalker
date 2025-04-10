const { RobloxData, RobloxPresence, RobloxFriends } = require("./services/roblox");
const { detectChanges } = require("./utils/changeTracker");
const { formatWebhookEmbed } = require("./utils/formatWebhook");
const { sendWebhookNotification } = require("./webhookNotifier");
const { MonitoredAccount } = require("./utils/database");
const cron = require("node-cron");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const scheduleTasks = async () => {
    const accounts = await MonitoredAccount.find({ platform: "roblox" });

    accounts.forEach((account) => {
        const interval = account.monitorInterval;

        cron.schedule(`*/${interval} * * * * *`, async () => {
            console.log(`Checking Roblox account: ${account.accountId}`);

            try {
                // Fetch user, presence, and friend list data
                const userData = await RobloxData(account.auth.cookie, account.accountId);
                const presenceData = await RobloxPresence(account.auth.cookie, [account.accountId]);
                const friendsData = await RobloxFriends(account.auth.cookie, account.accountId);

                const newData = {
                    userData: { ...userData },
                    presenceData: presenceData?.userPresences?.length > 0
                        ? presenceData.userPresences[0]
                        : null,
                    friendListData: { friends: friendsData } // Store the fetched list of friends
                };

                const oldData = account.oldData || {};

                console.log(`Got old Data`);
                console.log(`Got new Data`);

                const changes = detectChanges(oldData, newData);

                if (changes.length > 0) {
                    console.log(`Detected changes for account ${account.accountId}`);

                    const embed = formatWebhookEmbed(changes, account);

                    if (embed) {
                        await sendWebhookNotification(WEBHOOK_URL, embed);
                    }

                    // Update old data for the next check
                    account.oldData = newData;

                    try {
                        await account.save();
                        console.log(`Updated oldData for account ${account.accountId}`);
                    } catch (saveError) {
                        console.error(
                            `Failed to save updated data for account ${account.accountId}:`,
                            saveError.message
                        );
                    }
                } else {
                    console.log(
                        `No changes detected for Roblox account: ${account.accountId}`
                    );
                }
            } catch (error) {
                console.error(
                    `Error checking Roblox account ${account.accountId}:`,
                    error.message
                );
            }
        });
    });
};

module.exports = { scheduleTasks };