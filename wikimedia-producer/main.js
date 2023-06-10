const { Partitioners } = require('kafkajs');
const kafka = require('./kafka-connect');

const WikiMediaSource = require('./wikimedia-source');
const producer = kafka.producer({
    createPartitioner: Partitioners.DefaultPartitioner
});

const run = async () => {
    await producer.connect();
    const wikiMediaSource = new WikiMediaSource(producer);
    await wikiMediaSource.start();
};

run().catch(console.error)