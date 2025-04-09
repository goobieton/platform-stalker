require('dotenv').config();
const { dbConnect } = require('./utils/database');
const { scheduleTasks } = require('./scheduleTasks');

const startApp = async () => {
    try {
        await dbConnect();
        console.log('Database connected.');

        await scheduleTasks();
        console.log('Task scheduling initialized.');
    } catch (error) {
        console.error('Application failed to start:', error.message);
        process.exit(1);
    }
};

startApp();