import Bull from 'bull';
import dbClient from '../utils/db';

const userQueue = new Bull('userQueue');

userQueue.process(async (job) => {
    const { userId } = job.data;

    if (!userId) {
        throw new Error('Missing userId');
    }

    const user = await dbClient.db.collection('users').findOne({ _id: userId });

    if (!user) {
        throw new Error('User not found');
    }

    console.log(`Welcome ${user.email}!`);
});
