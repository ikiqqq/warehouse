require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_HEROKU,
    "password": process.env.HEROKU_PASSWORD,
    "database": process.env.HEROKU_DATABASE,
    "host": process.env.HEROKU_HOST,
    "dialect": "postgres",
    "dialectOptions": {
            "ssl": { "rejectUnauthorized": false }
        }
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql"
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
        "protocol": "postgres",
        "dialect": "postgres",
        "dialectOptions": {
            "ssl": {
                "rejectUnauthorized": false
            }
        }
  }
}
