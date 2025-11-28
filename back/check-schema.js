import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'hampihotels',
  password: 'secret',
  port: 5432
});

const query = `
  SELECT column_name, data_type, character_maximum_length 
  FROM information_schema.columns 
  WHERE table_name = 'properties' 
  ORDER BY ordinal_position;
`;

pool.query(query)
  .then(res => {
    console.table(res.rows);
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
