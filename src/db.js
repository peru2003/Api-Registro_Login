// Módulo sencillo de persistencia usando un archivo JSON.
// En un proyecto productivo se recomienda utilizar una base de datos.
const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");
const file = path.join(dataDir, "users.json");

function ensureDatabase() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf8");
}

function getUsers() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveUsers(users) {
  ensureDatabase();
  fs.writeFileSync(file, JSON.stringify(users, null, 2), "utf8");
}

module.exports = { getUsers, saveUsers };