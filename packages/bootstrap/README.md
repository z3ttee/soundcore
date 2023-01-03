# Soundcore Bootstrap Module
Bootstrap package to boot up a NestJS application.

# Motivation
Booting up a NestJS application comes with boilerplate code that is the same across multiple applications.
To have a single point of source code for such scenario, this package has been created. This package also comes with
a more friendly to read way to create a nest application. For more, see the usage section.

## Installation
```bash
npm install --save @soundcore/bootstrap
```
or using yarn
```bash
yarn add @soundcore/bootstrap
```

## Usage
First, you have to register the module in your `app.module.ts`:
```javascript
import { createBootstrap } from "@soundcore/bootstrap";
import { AppModule } from './app.module';
import { Logger, VersioningType } from '@nestjs/common';

// Create a logger to log messages
const logger = new Logger("Bootstrap");

// Call createBootstrap() with your desired application
// and the root module of your NestJS application
createBootstrap("Soundcore @NEXT", AppModule)
  // Define some additional options like you would in a normal NestFactory
  .useOptions({ cors: true, abortOnError: false })
  // Enable CORS, unnecessary in this example as we have already set cors to true
  .enableCors()
  // Enable versioning for api routes
  .enableVersioning({ type: VersioningType.URI, defaultVersion: "1" })
  // Bind to a specific host
  .useHost(process.env.BIND_ADDRESS || "0.0.0.0")
  // Define desired port of your application
  .usePort(Number(process.env.PORT) || 3002)
  // This will read a file containing some build info. The file must contain json data in the form of:
  // { name: string, version: string, date: number }.
  // Name = Application name
  // Version = Application's version
  // Date = Build date
  .withBuildInfo()
  // Call bootstrap to boot up nestjs application
  .bootstrap().then((app) => {
    // Do something with the app instance
    app.getUrl().then((url) => {
      logger.log(`Service now listening for requests on url '${url}'.`);      
    });
  });
```