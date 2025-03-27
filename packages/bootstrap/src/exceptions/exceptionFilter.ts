import { ArgumentsHost, Catch, HttpException } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { Response } from "express";
import { Observable } from "rxjs";

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  override catch(exception: HttpException, host: ArgumentsHost): Observable<never> | void {
    const httpStatus = exception.getStatus();

    if (host.getType() === "http") {
      // Just send the error as response
      // when in http context
      const response = host.switchToHttp().getResponse<Response>();
      response.status(httpStatus).json({
        statusCode: httpStatus,
        message: exception.message
      });
      return;
    }
  }
}
