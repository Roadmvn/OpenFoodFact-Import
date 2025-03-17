const Redis = require('redis');
const { promisify } = require('util');
const { logger } = require('../utils/logger');

class CacheService {
    constructor() {
        this.client = Redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        });

        this.client.on('error', (error) => {
            logger.error('Redis Error:', error);
        });

        this.client.on('connect', () => {
            logger.info('Connected to Redis');
        });

        // Promisify Redis commands
        this.getAsync = promisify(this.client.get).bind(this.client);
        this.setAsync = promisify(this.client.set).bind(this.client);
        this.delAsync = promisify(this.client.del).bind(this.client);
    }

    async get(key) {
        try {
            const data = await this.getAsync(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error('Redis GET Error:', error);
            return null;
        }
    }

    async set(key, value, expirationInSeconds = 3600) {
        try {
            await this.setAsync(
                key,
                JSON.stringify(value),
                'EX',
                expirationInSeconds
            );
            return true;
        } catch (error) {
            logger.error('Redis SET Error:', error);
            return false;
        }
    }

    async delete(key) {
        try {
            await this.delAsync(key);
            return true;
        } catch (error) {
            logger.error('Redis DELETE Error:', error);
            return false;
        }
    }

    generateKey(...args) {
        return args.join(':');
    }
}

module.exports = new CacheService();
