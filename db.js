const { Client } = require("pg");

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "hotel_booking",
  password: "krishdata",
  port: 5432,
});

db.connect()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to database:", err.stack);
  });

module.exports = db;
