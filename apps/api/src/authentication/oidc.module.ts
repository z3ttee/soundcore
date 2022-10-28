import { DynamicModule, Logger, Module, OnModuleInit } from '@nestjs/common';
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
export class OIDCModule implements OnModuleInit {
    private readonly logger: Logger = new Logger(OIDCModule.name);

    constructor(private readonly service: OIDCService){}

    public async onModuleInit() {
        await this.service.discoverIssuer().then((issuer) => {
            this.logger.log(`Discovered issuer at '${issuer.issuer}'`);
        }).catch((error: Error) => {
            this.logger.error(`Failed discovering issuer: ${error.message}`, error.stack);
        });
    }

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