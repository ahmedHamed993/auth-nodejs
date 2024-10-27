import { MongoClient } from "mongodb";

let db = null;
let dbClient = null;

export const getDB = () => {
  if (!db || !dbClient) {
    throw new Error("Database not connected. Call connectToDB first.");
  }
  return db;
};
export const getDbClient= () => {
  if (!dbClient) {
    throw new Error("Can not get db client.");
  }
  return dbClient;
};
// Function to connect to the database only once
export const connectToDB = async () => {
  if (!db) {
    try {
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      dbClient = client;
      db =  client.db();
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      process.exit(1); // Exit the application if connection fails
    }
  }
};
