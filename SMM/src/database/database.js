const firebase_admin = require("firebase-admin");
const service_account = require("./firebase.json");
const { database_url, database_name } = require("../config/config");

firebase_admin.initializeApp({
  credential: firebase_admin.credential.cert(service_account),
  databaseURL: database_url
});

const database = firebase_admin.database();
const collection = database.ref(`/${database_name}`);

module.exports = collection;