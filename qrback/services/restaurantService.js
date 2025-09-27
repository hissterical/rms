const pool = require('../setup/db');

function createRestaurant(name, email, address) {
    
  return pool.query(
    "INSERT INTO restaurants (name, contact_email, address) VALUES ($1, $2, $3) RETURNING *",
    [name, email, address]
  );
}

module.exports = { createRestaurant }