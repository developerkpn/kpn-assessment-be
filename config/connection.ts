import pg from "pg";
const { Pool, types } = pg;

// Make DATE return date only
types.setTypeParser(types.builtins.DATE, (value) => value);

const prodSettings = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  timezone: "+00:00",
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
  ssl: {
    rejectUnauthorized: false,
  },
};

const devSettings = {
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  timezone: "+00:00",
  idleTimeoutMillis: 3000,
  connectionTimeoutMillis: 30000,
  allowExitOnIdle: true,
  ssl: {
    rejectUnauthorized: false,
  },
};

export const db = new Pool(process.env.NODE_ENV === "production" ? prodSettings : devSettings);

// import pg from "pg";
// const { Pool, types } = pg;
// import dotenv from "dotenv";
// dotenv.config();

// // Make DATE return date only
// types.setTypeParser(types.builtins.DATE, (value) => value);

// const prodSettings = {
//   host: process.env.PGHOST,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   port: Number(process.env.PGPORT),
//   database: process.env.PGDATABASE,
//   timezone: "+00:00",
//   idleTimeoutMillis: 3000,
//   connectionTimeoutMillis: 30000,
//   allowExitOnIdle: true,
//   // Remove ssl property here to disable SSL
// };

// const devSettings = {
//   host: process.env.PGHOST,
//   user: process.env.PGUSER,
//   password: process.env.PGPASSWORD,
//   port: Number(process.env.PGPORT),
//   database: process.env.PGDATABASE,
//   timezone: "+00:00",
//   idleTimeoutMillis: 3000,
//   connectionTimeoutMillis: 30000,
//   allowExitOnIdle: true,
//   // Remove ssl property here to disable SSL
// };

// export const db = new Pool(
//   process.env.NODE_ENV === "production" ? prodSettings : devSettings
// );
