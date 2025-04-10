const { RobloxData, RobloxPresence, RobloxFriends } = require("./services/roblox");
const { detectChanges } = require("./utils/changeTracker");
const { getPlatformFormatter } = require("./messageFormatters");
const { sendWebhookNotification } = require("./webhookNotifier");
const { MonitoredAccount } = require("./utils/database");
const cron = require("node-cron");

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const scheduleTasks = async () => {
    const accounts = await MonitoredAccount.find(); // Fetch all monitored accounts.

    accounts.forEach((account) => {
        const interval = account.monitorInterval;

        cron.schedule(`*/${interval} * * * * *`, async () => {
            console.log(`Checking account: ${account.accountId} on platform: ${account.platform}`);

            try {
                // Fetch platform-specific data
                let newData = {};
                if (account.platform === "roblox") {
                    const userData = await RobloxData(account.auth.cookie, account.accountId);
                    const presenceData = await RobloxPresence(account.auth.cookie, [account.accountId]);
                    const friendsData = await RobloxFriends(account.auth.cookie, account.accountId);

                    newData = {
                        userData: { ...userData },
                        presenceData: presenceData?.userPresences?.length > 0
                            ? presenceData.userPresences[0]
                            : null,
                        friendListData: { friends: friendsData },
                    };
                } else {
                    console.log(`Unsupported platform: ${account.platform}`);
                    return;
                }

                const oldData = account.oldData || {};
                const changes = detectChanges(oldData, newData);

                if (changes.length > 0) {
                    console.log(`Detected changes for account ${account.accountId}`);

                    const formatter = getPlatformFormatter(account.platform);
                    const embeds = formatter(changes, account);

                    if (embeds) {
                        await sendWebhookNotification(WEBHOOK_URL, embeds);
                    }

                    account.oldData = newData;

                    try {
                        await account.save();
                        console.log(`Updated oldData for account ${account.accountId}`);
                    } catch (saveError) {
                        console.error(`Failed to save updated data for account ${account.accountId}:`, saveError.message);
                    }
                } else {
                    console.log(`No changes detected for account: ${account.accountId}`);
                }
            } catch (error) {
                console.error(`Error checking account ${account.accountId}:`, error.message);
            }
        });
    });
};

module.exports = { scheduleTasks };