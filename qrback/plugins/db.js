// plugins/db.js
// idk if we should do this or pool. 
const fp = require('fastify-plugin');

async function dbConnector(fastify) {
  fastify.register(require('fastify-postgres'), {
    connectionString: process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/qrmenu'
  });
}

module.exports = fp(dbConnector);
