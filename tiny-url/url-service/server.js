const express = require('express'); 
const app = express();
const db = require('./repository/db');
const cacheRepo = require('./repository/cache');
const urlController = require('./controller/url');
const { cacheIds } = require('./service/kafka-url-fetcher');


/**
 * The function connects to two data stores, a database and a cache.
 */
async function connectDataStores() {
    await db.connect();
    await cacheRepo.connect();
}

/**
 * This function registers URL routes for GET and POST requests using Express.js.
 */
function registerUrls() {
    app.use(express.json());
    app.get('/:shortId', async (req, res) => {
        await urlController.getUrl(req, res);
    });

    app.post('/url', async (req, res) => {
        await urlController.saveUrl(req, res);
    });
}

/**
 * This function caches ids and starts a server.
 */
async function cacheIdsAndStartServer() {
    await cacheIds().catch((err) => {
        console.error(err.message, err);
        process.exit(1);
    });

    console.log('Cached ids, starting server');
    app.listen(3000, () => {
        console.log('Server started');
    });
}

/**
 * The function connects to data stores, registers URLs, caches IDs, and starts the server.
 */
exports.start = async function start() {
    await connectDataStores();
    registerUrls();
    await cacheIdsAndStartServer();
}