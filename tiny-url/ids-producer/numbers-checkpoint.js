const mongoose = require("mongoose");

// Set the MongoDB connection URL
const url = `${process.env.DB_CONNECTION_STRING}/urls`;

// Define the schema for your collection
const mySchema = new mongoose.Schema({
  checkpoint: Number,
  id: String,
});

// Create a Mongoose model based on the schema
const NumberCheckpoint = mongoose.model("number_checkpoint", mySchema);

/**
 * The function connects to a database, retrieves a checkpoint number, updates it, and saves it back to
 * the database.
 * @returns the value of the `lastCheckpoint` variable, which is the current checkpoint number
 * incremented by the `idsCount` value.
 */
async function getLastCheckpoint() {
  const filter = {
    id: "checkpoint",
  };
  let lastCheckpoint;
  try {
    await mongoose.connect(url);
    const record = await NumberCheckpoint.findOne(filter);

    if (record) {
      const data = record.toObject();
      const idsCount = Number(process.env.PRODUCER_IDS_COUNT);
      lastCheckpoint = data.checkpoint || 1e9;
      data.checkpoint = lastCheckpoint + idsCount;
      await NumberCheckpoint.updateOne(filter, data);
      console.log("Record updated successfully!");
    } else {
        lastCheckpoint = 1e9;
      const data = {
        id: 'checkpoint',
        checkpoint: lastCheckpoint,
      };
      const newRecord = new NumberCheckpoint(data);
      await newRecord.save();
      console.log("New record created successfully!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error occurred:", error);
  }
  return lastCheckpoint;
}

// Call the function with your desired filter and update data
module.exports = getLastCheckpoint;
