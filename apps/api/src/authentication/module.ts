import { DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { PassportModule } from "@nestjs/passport";
import { ClerkAuthGuard } from "./guard";
import {
  ClerkClientConfig,
  ClerkClientConfigAsync,
  getClerkClientProvider,
  getClerkConfigProvider,
  getClerkConfigProviderAsync,
  getClerkJwksProvider,
} from "./providers";
import { ClerkStrategy } from "./strategy";

@Module({})
export class AuthenticationModule {
  public static forRootAsync(configAsync: ClerkClientConfigAsync): DynamicModule {
    return {
      global: true,
      module: AuthenticationModule,
      imports: [PassportModule],
      providers: [
        getClerkConfigProviderAsync(configAsync),
        getClerkClientProvider(),
        getClerkJwksProvider(),
        ClerkStrategy,
        {
          provide: APP_GUARD,
          useClass: ClerkAuthGuard,
        },
      ],
      exports: [PassportModule],
    };
  }

  public static forRoot(config: ClerkClientConfig): DynamicModule {
    return {
      global: true,
      module: AuthenticationModule,
      imports: [PassportModule],
      providers: [
        getClerkConfigProvider(config),
        getClerkClientProvider(),
        getClerkJwksProvider(),
        ClerkStrategy,
        {
          provide: APP_GUARD,
          useClass: ClerkAuthGuard,
        },
      ],
      exports: [PassportModule],
    };
  }
}
