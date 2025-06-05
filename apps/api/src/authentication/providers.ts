import { createClerkClient } from "@clerk/backend";
import { Provider } from "@nestjs/common";
import { Jwks } from "./entities/jwks";

export const DI_CLERK_CLIENT = "DI_CLERK_CLIENT";
export const DI_CLERK_JWKS = "DI_CLERK_CLIENT";
export const DI_CLERK_CONFIG = "DI_CLERK_CONFIG";

export type ClerkClientConfig = {
  publishableKey: string;
  secretKey: string;
};

export type ClerkClientConfigAsync = {
  useFactory: (...args: any[]) => ClerkClientConfig;
  inject: any[];
};

export function getClerkConfigProviderAsync(config: ClerkClientConfigAsync): Provider {
  return {
    provide: DI_CLERK_CONFIG,
    useFactory: config.useFactory,
    inject: config.inject || [],
  };
}

export function getClerkConfigProvider(config: ClerkClientConfig): Provider {
  return {
    provide: DI_CLERK_CONFIG,
    useValue: config,
  };
}

export function getClerkClientProvider(): Provider {
  return {
    provide: DI_CLERK_CLIENT,
    useFactory: async (config: ClerkClientConfig) => {
      return getClerkClient(config);
    },
    inject: [DI_CLERK_CONFIG],
  };
}

export function getClerkJwksProvider(): Provider {
  return {
    provide: Jwks,
    useFactory: async (config: ClerkClientConfig) => {
      const client = getClerkClient(config);
      const jwks = await client.jwks.getJwks().catch((error: Error) => {
        console.error("Failed to fetch JWKS:", error.message);
        throw error;
      });
      return Jwks.fromJson(jwks);
    },
    inject: [DI_CLERK_CONFIG],
  };
}

export type ClerkJwks = Awaited<ReturnType<ReturnType<typeof getClerkClient>["jwks"]["getJwks"]>>;

function getClerkClient(config: ClerkClientConfig) {
  return createClerkClient({
    publishableKey: config.publishableKey,
    secretKey: config.secretKey,
  });
}
