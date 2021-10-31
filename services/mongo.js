const mongoose = require("mongoose");

const MONGO_ATLAS_PASSWORD = "aSQGAHVKuug9fhJf";
const MONGO_URL = `mongodb+srv://nasa-api:${MONGO_ATLAS_PASSWORD}@nasa-api-cluster.tnbgr.mongodb.net/nasa?retryWrites=true&w=majority`;

mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
  console.error("Error: ", err);
});

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
