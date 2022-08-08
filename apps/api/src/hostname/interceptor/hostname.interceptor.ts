import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";
import { HOSTNAME_REQUEST_KEY } from "../hostname.module";

@Injectable()
export class HostnameBuilderInterceptor implements NestInterceptor {
    
    public async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
        const httpContext = context.switchToHttp();
        if(typeof httpContext === "undefined" || httpContext == null) return;

        const request = httpContext.getRequest() as Request;
        const port = parseInt(process.env.PORT);
        const baseUrl = `${request.protocol}://${request.hostname}${port ? `:${port}` : ``}`;
        const hostnameUrl = `${baseUrl}${request.path}`.split(/\/(v\d+)\//)?.[0];
        
        request[HOSTNAME_REQUEST_KEY] = hostnameUrl;

        return next.handle()
    }

}