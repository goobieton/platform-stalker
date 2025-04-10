const robloxFormatter = require("./robloxFormat");

const formatters = {
    roblox: robloxFormatter,
    // other platforms
};

const getPlatformFormatter = (platform) => {
    const formatter = formatters[platform];
    if (!formatter) {
        throw new Error(`No formatter found for platform: ${platform}`);
    }
    return formatter;
};

module.exports = { getPlatformFormatter };