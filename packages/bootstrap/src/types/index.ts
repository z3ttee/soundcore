import { DataSourceOptions, EntityManager } from "typeorm";

/**
 * Function to execute db init. This function
 * will be called inside a transaction.
 * @param manager EntityManager instance
 */
export type DbInitFn = (manager: EntityManager) => Promise<void>;
/**
 * Function to execute before application startup
 */
export type OnBeforeStartupFn<T = unknown> = () => T | Promise<T>;

export interface DBInitOptions {
  /**
   * Options to configure
   * database connection
   */
  dbOptions: DataSourceOptions;
  /**
   * Function to execute db init
   */
  dbInitFn: DbInitFn;
  /**
   * Set the dbinit to enabled or disabled.
   * Should be disabled in production environment
   * @default false
   */
  enabled?: boolean;
}

export interface RpcOptions {
  packageName: string;
  protoFile: string;
  port: number;
  loader?: {
    includeDirs?: string[];
  };
}
