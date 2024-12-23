import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    host: 'postgres_db',
    port: 5432,
    user: 'root',
    password: '1234',
    database: 'test_db',
  },
});

export default db;
