# SCDK :: Soundcore SDK
This part of the repository contains the development kit for the soundcore project. The goal of this package is to create an api client
to divide the frontend and frontend-to-backend communication.

## Usage
Before using all the services etc, you may want to register the sdk inside `app.module.ts` first. This can be done as follows:
```javascript
import { SCDKModule } from 'soundcore-sdk';
import { environment } from 'src/environments/environment';

@NgModule({
  imports: [
    SCDKModule.forRoot({
      api_base_uri: environment.api_base_uri
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

The most important configuration step is to set the `api_base_uri` correctly. This url will be used to build all the endpoints for communicating, therefor the
base url must point to the main entry point the api is reachable through.