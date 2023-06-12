const mongoose = require('mongoose');

exports.connect = async () => {
    const connectionString = process.env.DB_CONNECTION_STRING;
    await mongoose.connect(`${connectionString}/urls`, {
        
    }).then(() => {
        console.log('connected to mongodb');
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}