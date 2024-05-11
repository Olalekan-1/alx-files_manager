
const redis = require('redis');
const { promisify } = require('util');

class RedisClient {
    constructor() {
        this.client = redis.createClient();

        this.client.on('error', (error) => {
            console.error('Redis Client Error:', error);
        });
    }

    isAlive() {
        return this.client.connected;
    }

    async get(key) {
        const getAsync = promisify(this.client.get).bind(this.client);
        try {
            return await getAsync(key);
        } catch (error) {
            console.error('Redis Get Error:', error);
            return null;
        }
    }

    async set(key, value, duration) {
        try {
            await this.client.set(key, value, 'EX', duration);
            return true;
        } catch (error) {
            console.error('Redis Set Error:', error);
            return false;
        }
    }

    async del(key) {
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Redis Delete Error:', error);
            return false;
        }
    }
}

const redisClient = new RedisClient();

module.exports = redisClient;

