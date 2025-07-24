// ... (imports remain the same)

public class DataStreamJob {
    public static void main(String[] args) throws Exception {
        StreamExecutionEnvironment env = StreamExecutionEnvironment.getExecutionEnvironment();

        Properties kafkaProps = new Properties();
        kafkaProps.setProperty("bootstrap.servers", "localhost:9092");
        kafkaProps.setProperty("group.id", "flink-leaderboard");

        KafkaSource<String> kafkaSource = KafkaSource.<String>builder()
            .setBootstrapServers("localhost:9092")
            .setTopics("match-events")
            .setGroupId("flink-leaderboard")
            .setValueOnlyDeserializer(new SimpleStringSchema())
            .setStartingOffsets(OffsetsInitializer.earliest())
            .build();

        DataStream<String> stream = env.fromSource(
            kafkaSource,
            WatermarkStrategy.noWatermarks(),
            "Kafka Source"
        );

        stream
            .map(new MatchEventProcessor())
            .name("Process Match Event");

        env.execute("Leaderboard Flink Processor");
    }

    static class MatchEventProcessor implements MapFunction<String, Void> {
        private transient JedisPool jedisPool;

        @Override
        public void open(org.apache.flink.configuration.Configuration parameters) throws Exception {
            JedisPoolConfig poolConfig = new JedisPoolConfig();
            poolConfig.setMaxTotal(10);
            poolConfig.setMaxIdle(5);
            poolConfig.setMinIdle(1);
            poolConfig.setTestOnBorrow(true);
            poolConfig.setTestOnReturn(true);
            poolConfig.setTestWhileIdle(true);

            jedisPool = new JedisPool(poolConfig, "localhost", 6379);
        }

        @Override
        public Void map(String value) throws Exception {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode event = mapper.readTree(value);

            String playerId = event.get("playerId").asText();
            int score = event.get("score").asInt();
            String matchId = event.get("matchId").asText(); // <-- Ensure matchId is present in event!

            try (Jedis redis = jedisPool.getResource()) {
                // CORRECTED KEY: include matchId
                Set<String> userIds = redis.smembers("player:" + matchId + ":" + playerId);

                if (!userIds.isEmpty()) {
                    redis.pipelined().syncAndReturnAll(() -> {
                        for (String userId : userIds) {
                            redis.zincrby("leaderboard:" + matchId, score, userId);
                        }
                    });
                }
            } catch (Exception e) {
                System.err.println("Error processing event or updating Redis: " + e.getMessage());
            }

            return null;
        }

        @Override
        public void close() throws Exception {
            if (jedisPool != null) {
                jedisPool.close();
            }
        }
    }
}