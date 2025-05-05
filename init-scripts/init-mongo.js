/* eslint-disable no-undef */
const MONGO_LOGIN = process.env.MONGO_USER;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_DB = process.env.MONGO_DB;

use(MONGO_DB);
const pollsDb = db.getSiblingDB(MONGO_DB);
const userExists = pollsDb.getUser(MONGO_LOGIN);
print('START USERS CREATION');
if (!userExists) {
  print(`Creating user "${MONGO_LOGIN}"...`);
  db.createUser({
    user: MONGO_LOGIN,
    pwd: MONGO_PASSWORD,
    roles: [{ role: 'readWrite', db: MONGO_DB }],
  });
  print(`User "${MONGO_LOGIN}" created successfully.`);
} else {
  print(`User "${MONGO_LOGIN}" already exists.`);
}
