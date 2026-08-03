import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<ApiResponse> {
    const request = context.switchToHttp().getRequest();
    if (request.url.includes('/docs')) {
      return next.handle() as Observable<ApiResponse>;
    }
    return next.handle().pipe(
      map((data) => ({
        success: true,
        message: 'OK',
        data: (data ?? null) as unknown,
      })),
    );
  }
}
