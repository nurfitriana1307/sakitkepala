const { MongoClient } = require('mongodb');

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect('mongodb://localhost:27017/nodejs_mongodb_api')
      .then((client) => {
        dbConnection = client.db();
        return cb();
      })
      .catch((err) => {
        console.log(err);
        return cb(err);
      });
  },

  getDb: () => {
    if (!dbConnection) {
      console.log('Database connection not established.');
    }
    return dbConnection;
  },
};
