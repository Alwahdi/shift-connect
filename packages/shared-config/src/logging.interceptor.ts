import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          this.logger.log(
            JSON.stringify({
              method,
              url,
              statusCode: res.statusCode,
              duration,
              ip,
            }),
          );
        },
        error: (err: Error) => {
          const duration = Date.now() - start;
          this.logger.error(
            JSON.stringify({
              method,
              url,
              error: err.message,
              duration,
              ip,
            }),
          );
        },
      }),
    );
  }
}
