const cacheRepo = require('../repository/cache');
const { getShortId } = require('./kafka-url-fetcher');
const Url = require('../models/db/url');
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;


/**
 * The function checks if a given time is expired or not based on the current time.
 * @param [time] - The `time` parameter is a timestamp value representing a specific point in time. It
 * is an optional parameter with a default value of `Date.now()`, which returns the current timestamp
 * value. The function checks if the current timestamp value is greater than the `time` parameter,
 * indicating that the URL has
 * @returns The function `isURLExpired` returns a boolean value indicating whether the current time (in
 * milliseconds since January 1, 1970) is greater than the time passed as an argument. If the time
 * passed as an argument is in the past, the function will return `true`, indicating that the URL has
 * expired. If the time passed as an argument is in the future, the function will return
 */
function isURLExpired(time = Date.now()) {
    return Date.now() > time;
}

/**
 * The function retrieves a long URL from a cache or database based on a given short URL.
 * @param url - The input parameter for the function `getLongURL()`. It is a string representing a
 * shortened URL.
 * @returns The function `getLongURL` returns either an object containing the long URL and short URL if
 * it exists in the cache or database and is not expired, or `null` if it does not exist or is expired.
 */
async function getLongURL(url) {
    const cacheKey = `url:${url}`;
    const cacheClient = cacheRepo.getClient();
    let cacheData = await cacheClient.get(cacheKey);
    if (cacheData) {
        const data = JSON.parse(cacheData);
        if (isURLExpired(data.expire)) {
            return null;
        }
        return data;
    }

    const dbData = await Url.findOne({ s: url });
    if (dbData) {
        const urlObject = dbData.toObject();
        if (isURLExpired(urlObject.expire)) {
            return null;
        }
        await cacheClient.set(cacheKey, JSON.stringify({
            l: urlObject.l,
            expire: urlObject.expire,
        }));

        return urlObject;
    }

    return null;
}

/**
 * This function retrieves the long URL associated with a given short ID.
 * @returns The function `getLongUrl` is returning the long URL associated with the given `shortId`. It
 * does this by calling the `getLongURL` function with the `shortId` parameter, and then returning the
 * `l` property of the resulting `data` object. If the `data` object is null or undefined, the function
 * will return `undefined`.
 */
const getLongUrl = async ({ shortId }) => {
    const data = await getLongURL(shortId);
    return data?.l;
};

/**
 * This function generates a short URL for a given long URL and saves it in a database and cache.
 * @returns The function `getShortUrl` returns a Promise that resolves to a string representing the
 * short URL. If the long URL already exists in the database, it returns the corresponding short URL
 * from the database. If not, it generates a new short ID, creates a new URL object with the long and
 * short URLs, saves it to the database, saves it to the cache, and returns the new short ID
 */
async function getShortUrl({ url, expire }) {
    // if long url exists in DB, then return that only
    const data = await Url.findOne({ l: url });
    if (data) {
        return data.toObject().s;
    }
    
    // get a random short id
    const shortId = await getShortId();
    const expiry = Date.now() + (expire || ONE_DAY_IN_MS);
    const urlObject = new Url({
        l: url,
        s: shortId,
        expire: expiry,
    });
    await urlObject.save();

    // save in cache after writing to DB.
    const cacheKey = `url:${shortId}`;
    const cacheClient = cacheRepo.getClient();
    await cacheClient.set(cacheKey, JSON.stringify({
        l: url,
        expire: expiry,
    }));

    return shortId;
};

module.exports = {
    getLongUrl,
    getShortUrl,
}