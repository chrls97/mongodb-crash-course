// MongoClient is used to connect to a MongoDB database
const { MongoClient } = require('mongodb');
const dotenv  = require('dotenv');

dotenv.config();
// Declare a variable to hold the database connection
let dbConnection;
//nodsetuts
const dbURI = process.env.MONGODB_URI;

// to export all function 
module.exports = {
  connectToDb: (callback) =>{
    // to connect in local mongodb
    MongoClient.connect(dbURI)
      // If the connection is successful, the promise resolves with the client object
      .then((client) => {
        // Assign the database connection to the dbConnection variable
        dbConnection = client.db()
        // Call the callback function (without any error, indicating success)
        return callback()
      })
      .catch((error) => {
        console.log(error)
        return callback(error)
      })
  },
  // to communicate with database to do CRUD
  // Returns the dbConnection object that was set in connectToDb
  // This allows other parts of the application to access the database without having to reconnect
  getDb: () => dbConnection
}