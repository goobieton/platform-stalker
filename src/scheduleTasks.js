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
            try {
                const userData = await RobloxData(account.auth.cookie, account.accountId);
                const presenceData = await RobloxPresence(account.auth.cookie, [account.accountId]);
                const friendsData = await RobloxFriends(account.auth.cookie, account.accountId);

                const newData = {
                    userData: { ...userData },
                    presenceData: presenceData?.userPresences?.length > 0
                        ? presenceData.userPresences[0]
                        : null,
                    friendListData: { friends: friendsData }
                };

                const oldData = account.oldData || {};

                const changes = detectChanges(oldData, newData);

                if (changes.length > 0) {
                    const embed = formatWebhookEmbed(changes, account);

                    if (embed) {
                        await sendWebhookNotification(WEBHOOK_URL, embed);
                    }

                    account.oldData = newData;

                    try {
                        await account.save();
                    } catch (saveError) {}
                }
            } catch (error) {}
        });
    });
};

module.exports = { scheduleTasks };