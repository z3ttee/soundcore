import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { OIDCConfig } from './config/oidc.config';
import { OIDCGuard } from './guard/oidc.guard';
import { RequestInterceptor } from './interceptor/request.interceptor';
import { OIDC_OPTIONS } from './oidc.constants';
import { OIDCService } from './services/oidc.service';

@Module({
    imports: [
        UserModule,
        JwtModule.register({})
    ],
    providers: [
        OIDCService
    ]
})
export class OIDCModule {

    public static forRoot(options: OIDCConfig): DynamicModule {
        return {
            module: OIDCModule,
            global: true,
            providers: [
                OIDCService,
                {
                    provide: OIDC_OPTIONS,
                    useValue: options
                },
                {
                    provide: APP_GUARD,
                    useClass: OIDCGuard
                },
                {
                    provide: APP_INTERCEPTOR,
                    useClass: RequestInterceptor,
                }
            ],
            exports: [
                OIDCService,
                OIDC_OPTIONS
            ]
        }
    }

}