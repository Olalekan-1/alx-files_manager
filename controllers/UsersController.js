import dbClient from '../utils/db';
import Bull from 'bull';

const userQueue = new Bull('userQueue');

class UsersController {
    static async postUser(req, res) {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }

        try {
            const result = await dbClient.db.collection('users').insertOne({ email });

            // Queue job for sending welcome email
            userQueue.add({ userId: result.insertedId });

            return res.status(201).json({ message: 'User created successfully' });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

export default UsersController;
