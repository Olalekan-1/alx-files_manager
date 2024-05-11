
import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        const uri = `mongodb://${host}:${port}/${database}`;

        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        this.client.connect((err) => {
            if (err) {
                console.error('DB Connection Error:', err);
            } else {
                console.log('Connected to MongoDB');
            }
        });
        this.db = this.client.db(database);
    }

    isAlive() {
        return this.client.isConnected();
    }

    async nbUsers() {
        try {
            const usersCollection = this.db.collection('users');
            const count = await usersCollection.countDocuments();
            return count;
        } catch (error) {
            console.error('DB Count Users Error:', error);
            return 0;
        }
    }

    async nbFiles() {
        try {
            const filesCollection = this.db.collection('files');
            const count = await filesCollection.countDocuments();
            return count;
        } catch (error) {
            console.error('DB Count Files Error:', error);
            return 0;
        }
    }
}

const dbClient = new DBClient();

export default dbClient;

