const mongoose = require('mongoose');

const monitoredAccountSchema = new mongoose.Schema({
    platform: { type: String, required: true },
    accountId: { type: String, required: true },
    auth: { type: Object, required: true },
    oldData: { type: Object, default: {} },
    monitorInterval: { type: Number, default: 60 },
});

const MonitoredAccount = mongoose.model('MonitoredAccount', monitoredAccountSchema);

const dbConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Could not connect to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = { dbConnect, MonitoredAccount };