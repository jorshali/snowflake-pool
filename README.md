
# snowflake-pool

A Promise-based connection pool for your [Snowflake](https://www.snowflake.net/) data warehouse.

This is a simple wrapper that enables pooling of [Snowflake SDK](https://www.npmjs.com/package/snowflake-sdk) connections.  In addition, this wrapper makes use of the [snowflake-promise](https://www.npmjs.com/package/snowflake-promise) API which provides a Promise-based API instead of the core callback-based API.

## Installation

* `npm i snowflake-pool`

## Basic usage

```typescript
const connectionPool = createSnowflakePool({
    account: '<account name>',
    username: '<username>',
    password: '<password>',
    database: 'SNOWFLAKE_SAMPLE_DATA',
    schema: 'SOLUTIONSFIT_TEST',
    warehouse: 'DEMO'
  });
}

await connectionPool.use((client) =>
  const rows = await client.execute(
    'SELECT COUNT(*) FROM USERS WHERE FIRSTNAME=:1',
    ['John']
  );

  console.log(rows);
);
```

## Usage with Pooling Configuration

```typescript
const connectionPool = createSnowflakePool({
    account: '<account name>',
    username: '<username>',
    password: '<password>',
    database: 'SNOWFLAKE_SAMPLE_DATA',
    schema: 'SOLUTIONSFIT_TEST',
    warehouse: 'DEMO'
  }, {
    max: 10
    min: 0,
    autostart: false,
    idleTimeoutMillis: 60 * 60 * 1000,
    evictionRunIntervalMillis: 60 * 1000,
  });
}

await connectionPool.use((client) =>
  const rows = await client.execute(
    'SELECT COUNT(*) FROM USERS WHERE FIRSTNAME=:1',
    ['John']
  );

  console.log(rows);
);
```

## Connecting

The `createSnowflakePool` function takes up to four arguments:

`createSnowflakePool(connectionOptions, [ poolOptions, [ loggingOptions, [ configureOptions ] ] ])`

* `connectionOptions`
  * Supported options are here: <https://docs.snowflake.net/manuals/user-guide/nodejs-driver-use.html#required-connection-options>
* `poolOptions`
  * Most supported options are found here under ops: <https://www.npmjs.com/package/generic-pool>, with the addition of,
  * `validate` (optional, function): If provided will call this function to validate a connection.
* `loggingOptions`
  * Most supported options are found here under ops: <https://www.npmjs.com/package/snowflake-promise#connecting>, with the addition of:
  * `logConnection` (optional, function): If provided, this function will be called to log connection pooling status messages. For example, set `logConnection` to `console.log` to log all connection pooling status messages to the console.
* `configureOptions`
  * Supported options are here: <https://www.npmjs.com/package/snowflake-promise#connecting>
