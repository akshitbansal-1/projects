const osClient = require('./opensearch-client');
const kafkaClient = require('./kafka-connect');
const { v4: randomUUID } = require('uuid');

const consumer = kafkaClient.consumer({ groupId: 'opensearch' });

const index_name = 'wikimedia';
const createIndex = async () => {
    const settings = {
    settings: {
        index: {
            number_of_shards: 4,
            number_of_replicas: 3,
        },
        },
    };

    const exists = await osClient.indices.exists({ index: index_name });
    if (!exists.body) {
        const response = await osClient.indices.create({
            index: index_name,
            body: settings,
        });

        console.log(response.body);
    }
}


const run = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: "wikimedia-topic" });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const val = message.value.toString();
            try {
                const response = await osClient.index({
                    id: randomUUID(),
                    index: index_name,
                    body: val,
                    refresh: true,
                });
                console.log(`inserted: ${response.body._id}`);
            } catch (err) {
                console.error(err.message);
            }
        },
    });
};



createIndex().then(run).catch(console.error);