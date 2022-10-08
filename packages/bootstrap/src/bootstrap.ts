import { INestApplication, NestApplicationOptions, NestHybridApplicationOptions, VersioningOptions } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions } from '@nestjs/microservices';
import { BehaviorSubject, filter, firstValueFrom, map } from "rxjs";
import { Printer } from "./printer";
import { buildHttpsOptions } from "./ssl";

const appUrlSubject: BehaviorSubject<string> = new BehaviorSubject(null);

interface Microservice {
  options: MicroserviceOptions;
  hybridOptions?: NestHybridApplicationOptions
}

class Bootstrapper {

  private _options: NestApplicationOptions = null;
  private _versioningOptions: VersioningOptions = null;
  private _microservices: Microservice[] = [];
  private _enableCors: boolean = false;
  private _port: number = 3002;
  private _host: string = "0.0.0.0";
  private _withBuildInfo: boolean = false;
  private _buildInfoFilepath: string = "./buildinfo.json";

  constructor(
    protected readonly appName: string,
    protected readonly module: any
  ) {}

  public useOptions(options: NestApplicationOptions): Bootstrapper {
    this._options = options;
    return this;
  }

  public withBuildInfo(filepath: string = "./buildinfo.json"): Bootstrapper {
    this._withBuildInfo = true;
    this._buildInfoFilepath = filepath;
    return this;
  }

  public enableCors(): Bootstrapper {
    this._enableCors = true;
    return this;
  }

  public enableVersioning(options: VersioningOptions): Bootstrapper {
    this._versioningOptions = options;
    return this;
  }

  public addMicroservice(microservice: Microservice): Bootstrapper {
    this._microservices.push(microservice);
    return this;
  }

  public usePort(port: number): Bootstrapper {
    this._port = port;
    return this;
  }

  public useHost(host: string): Bootstrapper {
    this._host = host;
    return this;
  }
  
  public async bootstrap(): Promise<INestApplication> {
    await Printer.printLogo();
    if(this._withBuildInfo) await Printer.printBootstrapInfo(this.appName, this._buildInfoFilepath);
    await Printer.printCopyright();
    
    // Build httpsOptions. This will lookup cert and privkey
    // files. If the do not exist, the service will not support https.
    const httpsOptions = await buildHttpsOptions();

    // Bootstrap app using root module
    const app = await NestFactory.create(this.module, {
      ...this._options,
      httpsOptions
    });

    // Enable cors
    if(this._enableCors) app.enableCors();
    
    // Enable versioning
    if(this._versioningOptions) app.enableVersioning(this._versioningOptions);

    // Connect microservices
    for(const microservice of this._microservices) {
      app.connectMicroservice<MicroserviceOptions>(microservice.options, microservice.hybridOptions);
    }

    return app.startAllMicroservices().then((app) => {
      return app.listen(this._port, this._host).then(() => {
        return app.getUrl().then((url) => {
          console.log(url);
          appUrlSubject.next(url);
          return app;
        })
      });
    });
  }
}

export function createBootstrap(appName: string, module: any): Bootstrapper {
  return new Bootstrapper(appName, module);
}

export async function getUrl(): Promise<string> {
  return firstValueFrom(appUrlSubject.pipe(filter((url) => typeof url !== "undefined" && url != null && url !== ""))).then((url) => {
    return url;
  });
}
