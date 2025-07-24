const Redis = require('ioredis');
let client = {
    client: null,
}
exports.connect = async () => {
    const cacheHost = process.env.CACHE_HOST || '127.0.0.1';
    const cachePwd = process.env.CACHE_PASSWORD || '';
    const cachePort = process.env.CACHE_PORT || '6379';
    const isClustered = process.env.CACHE_CLUSTERED === 'true';
    if (isClustered) {
        client.client = new Redis.Cluster(
            [
                {
                    port: cachePort,
                    host: cacheHost
                },
            ],
            {
                password: cachePwd,
            }
        );
    } else {
        client.client = new Redis({
            host: cacheHost,
            password: cachePwd,
            port: cachePort
        });
    }
};

exports.getClient = () => {
    return client.client;
}