const validate = require('../models/request/url');
const urlService = require('../service/url-service');
const getUrl = async (req, res) => {
    const shortId = req.params.shortId;
    try {
        validate({ shortId }, 'getLongURLRequest');
    } catch (err) {
        return res.status(400).json({
            message: 'Invalid request body'
        });
    }

    try {
        const longUrl = await urlService.getLongUrl({
            shortId
        });
        if (longUrl) {
            return res.redirect(longUrl);
        }
        return res.status(404).json({
            message: 'Entity not found',
        })
    } catch (err) {
        // TODO add log here
        res.status(500).json({
            message: 'An unknown error occurred',
        });
    }
};


const saveUrl = async (req, res) => {
    const { url, expire } = req.body;
    try {
        validate({ url, expire }, 'postUrlRequestModel');
    } catch (err) {
        return res.status(400).json({
            message: 'Invalid request body'
        });
    }

    try {
        const shortId = await urlService.getShortUrl({
            url, expire,
        });
        if (shortId) {
            return res.status(201).json({
                shortId,
            });
        }

        return res.status(500).json({
            message: 'An unknown error occurred',
        });
    } catch (err) {
        // TODO add error here
        return res.status(500).json({
            message: 'An unknown error occurred',
        })
    }
};

module.exports = {
    getUrl,
    saveUrl,
}