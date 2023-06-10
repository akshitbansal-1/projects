const host = 'localhost';
const protocol = 'http';
const port = 9200;

// Create a client with SSL/TLS enabled.
const { Client } = require('@opensearch-project/opensearch');
const client = new Client({
  node: 'http://localhost:9200',
});

module.exports = client;