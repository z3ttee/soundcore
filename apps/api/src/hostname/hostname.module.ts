import { Module } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { HostnameBuilderInterceptor } from "./interceptor/hostname.interceptor";

export const HOSTNAME_REQUEST_KEY = "hostname-request-key"

@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: HostnameBuilderInterceptor
        }
    ]
})
export class HostnameModule {}