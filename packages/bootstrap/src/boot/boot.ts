import {
  CanActivate,
  ExceptionFilter,
  INestApplication,
  PipeTransform,
  ValidationPipe,
  VersioningType
} from "@nestjs/common";
import { VersioningOptions } from "@nestjs/common/interfaces";
import { CorsOptions, CorsOptionsDelegate } from "@nestjs/common/interfaces/external/cors-options.interface";
import { NestFactory } from "@nestjs/core";
import { FILE_SERVICE_INFO } from "../constants";
import { DefaultServiceInfo } from "../entities/service-info.entity";
import { Environment } from "../environment";
import { HttpExceptionFilter } from "../exceptions/exceptionFilter";
import { MissingServiceInfoFileException } from "../exceptions/missingServiceInfo";
import { DBInitOptions, OnBeforeStartupFn } from "../types";
import { executeDbInit } from "../utils/executeDbInit";
import logger from "../utils/logger";
import { LogoOptions, printLogo } from "../utils/printLogo";
import { readServiceInfo } from "../utils/readServiceInfo";

/**
 * Bootstrapper for the NestJS application.
 * This is used to build a new instance for a NestJS application
 * that allows for imperative configuration using the builder pattern.
 */
export class NGSBootstrapper {
  /** @ignore */
  private readonly _globalPipes: Set<PipeTransform> = new Set();
  /** @ignore */
  private readonly _globalFilters: Set<ExceptionFilter> = new Set();
  /** @ignore */
  private readonly _globalGuards: Set<CanActivate> = new Set();
  /** @ignore */
  private _corsOptions?: boolean | CorsOptions | CorsOptionsDelegate<unknown>;
  /** @ignore */
  private _versionOptions?: VersioningOptions;
  /** @ignore */
  private _onBeforeStartupFn?: OnBeforeStartupFn;

  /** @ignore */
  private _logoOptions?: LogoOptions;
  /** @ignore */
  private _withLogo?: boolean = true;
  /** @ignore */
  private _dbInitOptions?: DBInitOptions;
  /** @ignore */
  private _port!: number;
  /** @ignore */
  private constructor(private readonly module: any) { }
  /**
   * Create a new instance of the bootstrapper
   * @param module Root module of the NestJS application
   * @returns Instance of the bootstrapper for further configuration
   */
  public static create(module: unknown): NGSBootstrapper {
    return new NGSBootstrapper(module);
  }
  /**
   * Update CORS settings
   * @returns Instance of the current bootstrapper
   */
  public setCors(options: boolean | CorsOptions | CorsOptionsDelegate<unknown>): NGSBootstrapper {
    this._corsOptions = options;
    return this;
  }

  /** Set version options */
  public setVersioning(options: VersioningOptions): NGSBootstrapper {
    this._versionOptions = options;
    return this;
  }
  /**
   * Register a callback that is executed
   * before the application is started
   * @param beforeStartupFn Function to execute before the application is started
   * @returns Instance of the current bootstrapper
   */
  public onBeforeStartup<TInitReturnValue = unknown>(
    beforeStartupFn: OnBeforeStartupFn<TInitReturnValue>
  ): NGSBootstrapper {
    this._onBeforeStartupFn = beforeStartupFn;
    return this;
  }
  /**
   * Register a new global pipe
   * @param pipe Global pipe implementation to register
   * @returns Instance of the current bootstrapper
   */
  public registerGlobalPipe(pipe: PipeTransform): NGSBootstrapper {
    this._globalPipes.add(pipe);
    return this;
  }
  /**
   * Register a new global pipe
   * @param pipe Global pipe implementation to register
   * @returns Instance of the current bootstrapper
   */
  public registerGlobalFilter(filter: ExceptionFilter): NGSBootstrapper {
    this._globalFilters.add(filter);
    return this;
  }
  /**
   * Register a new global guard
   * @param guard Global guard implementation to register
   * @returns Instance of the current bootstrapper
   */
  public registerGlobalGuard(guard: CanActivate): NGSBootstrapper {
    this._globalGuards.add(guard);
    return this;
  }
  /**
   * Start the application by binding to a port
   * @param port Port that the application should bind to
   */
  public async listen(port: number): Promise<INestApplication<any>> {
    this._port = port;
    return this.bootstrapApplication();
  }
  /**
   * Configure the branding that is printed to stdout
   * @param enableLogo Enable printing the branding by setting this to `true` or disable the branding by setting this to `false`. Default is `true`
   * @returns Instance of the current bootstrapper
   */
  public withLogo(enableLogo: boolean): NGSBootstrapper;
  /**
   * Configure the branding that is printed to stdout
   * @param logoOptions Options to configure the branding
   * @returns Instance of the current bootstrapper
   */
  public withLogo(logoOptions: LogoOptions): NGSBootstrapper;
  /** @ignore */
  public withLogo(logoOptionsOrBool: LogoOptions | boolean): NGSBootstrapper {
    // Check if boolean is set,
    // then enable/disable logo based on that value
    if (typeof logoOptionsOrBool === "boolean") {
      this._withLogo = logoOptionsOrBool;
      return this;
    }

    this._logoOptions = logoOptionsOrBool;
    return this;
  }

  /**
   * Add a function handler to initialize the
   * database before application startup.
   * @param initOptions Options to configure db init
   * @returns Instance of the current bootstrapper
   */
  public withDbInit(initOptions: DBInitOptions): NGSBootstrapper {
    this._dbInitOptions = initOptions;
    return this;
  }

  /** @ignore */
  private async bootstrapApplication(): Promise<INestApplication<unknown>> {
    if (this._withLogo) {
      // Print logo to the console
      printLogo(this._logoOptions);
    }

    // Check if dbInit was set
    if (typeof this._dbInitOptions === "object" && this._dbInitOptions.enabled) {
      // If true, execute db init
      await executeDbInit(this._dbInitOptions.dbOptions, this._dbInitOptions.dbInitFn, logger).catch(() => {
        logger.warn(`Application is now starting without database initialization.`);
      });
    }

    // Reading service info
    const service_info = await readServiceInfo().catch((error: Error) => {
      logger.error(`Cannot bootstrap service: ${error.message}`);

      // When the error is because of the missing service info file
      // Print how this file can be generated
      if (error instanceof MissingServiceInfoFileException) {
        logger.error(
          `Please check if you have a '${FILE_SERVICE_INFO}'-file in your root directory of the application.`
        );
        logger.error(`If not, generate a new file with the following contents: `);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { client_secret, ...others } = DefaultServiceInfo;
        console.log(JSON.stringify(others, null, 2));
      }

      // Shutdown the application when service info
      // collection failed
      process.exit(1);
    });

    if (typeof this._onBeforeStartupFn === "function") {
      await this._onBeforeStartupFn();
    }

    logger.log(
      `Starting service '${service_info.client_id}' with version '${service_info.client_version}' in ${Environment.isDev ? "development" : "production"} mode.`
    );
    // Create app instance using the root module
    const app = await NestFactory.create(this.module as any, {
      cors: this._corsOptions
    });
    // Set versioning
    app.enableVersioning(this._versionOptions ?? { type: VersioningType.URI, defaultVersion: "1" });
    // Add global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true
      }),
      ...this._globalPipes.values()
    );
    // Register global exception filters
    app.useGlobalFilters(new HttpExceptionFilter(), ...this._globalFilters.values());
    // Register global guards
    app.useGlobalGuards(...this._globalGuards.values());
    // Bind to the provided port
    return app.listen(this._port);
  }
}
