import { Snowflake, ConnectionOptions } from 'snowflake-promise';
import { Options, Factory, createPool } from 'generic-pool';
import { LoggingOptions as PromiseLoggingOptions } from 'snowflake-promise/build/src/types/LoggingOptions';
import { ConfigureOptions } from 'snowflake-promise/build/src/types/ConfigureOptions';

type PoolOptions = Options & {
  /** optional function to validate a connection is still up in the pool */
  validate?: (client: Snowflake) => Promise<boolean>;
}

type LoggingOptions = PromiseLoggingOptions & {
  /** optional function to log pool connection status (e.g. console.log) */
  logConnection?: (connectionStatus: string) => void;
}

class SnowflakeConnectionFactory implements Factory<Snowflake> {
  private connectionLoggingEnabled: boolean;

  constructor(
    private connectionOptions: ConnectionOptions,
    private poolOptions?: PoolOptions,
    private loggingOptions?: LoggingOptions,
    private configureOptions?: ConfigureOptions,
  ) {
    this.connectionLoggingEnabled = this.loggingOptions && !!this.loggingOptions.logConnection;
  }

  async create(): Promise<Snowflake> {
    const client = new Snowflake(this.connectionOptions, this.loggingOptions, this.configureOptions);

    if (this.connectionLoggingEnabled) {
      this.loggingOptions.logConnection(`Establishing Snowflake connection to account: ${this.connectionOptions.account}, warehouse: ${this.connectionOptions.warehouse}.`);
    }

    await client.connect();

    return client;
  }

  async destroy(client: Snowflake): Promise<void> {
    if (this.connectionLoggingEnabled) {
      this.loggingOptions.logConnection('Destroying Snowflake connection...');
    }

    await client.destroy();

    if (this.connectionLoggingEnabled) {
      this.loggingOptions.logConnection('Snowflake connection destroyed.');
    }
  }

  async validate?(client: Snowflake): Promise<boolean> {
    if (this.poolOptions.validate) {
      if (this.connectionLoggingEnabled) {
        this.loggingOptions.logConnection('Validating Snowflake connection...');
      }

      const valid = await this.poolOptions.validate(client);

      if (!valid) {
        this.loggingOptions.logConnection('Connection is invalid, ejecting from pool');
      }

      return valid;
    }

    return true;
  }
}

/**
 * Creates a new Snowflake connection pool instance.
 *
 * @param connectionOptions The Snowflake connection options
 * @param poolOptions The Snowflake connection pooling options
 * @param loggingOptions Controls query logging, connection logging, and SDK-level logging
 * @param configureOptions Additional configuration options
 */
export const createSnowflakePool = (
  connectionOptions: ConnectionOptions, 
  poolOptions?: PoolOptions,
  loggingOptions?: LoggingOptions,
  configureOptions?: ConfigureOptions
) => {
  const connectionPool = createPool(
    new SnowflakeConnectionFactory(
      connectionOptions, 
      poolOptions,
      loggingOptions, 
      configureOptions
    ), poolOptions);

  return connectionPool;
}
