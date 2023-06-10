const EventSource = require('eventsource');
const { CompressionTypes } = require('kafkajs');
class WikiMediaSource {
    constructor(kafkaProducer) {
        this.kafkaProducer = kafkaProducer;
    }

    async start() {
        const source = new EventSource('https://stream.wikimedia.org/v2/stream/recentchange');
        let received = 0;
        const producer = this.kafkaProducer;
        source.onmessage = async function(e) {
            received++;
            await producer.send({
                topic: 'wikimedia-topic',
                messages: [
                    {
                        value: e.data,
                    }
                ],
                // compression: CompressionTypes.GZIP,
            })
        };
        // setInterval(() => {
        //     console.log(`reecived: ${received}`);
        // }, 1000);
    }
}
module.exports =  WikiMediaSource;