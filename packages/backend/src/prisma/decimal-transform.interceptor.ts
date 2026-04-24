import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Prisma } from '@prisma/client';

@Injectable()
export class DecimalTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformDecimals(data)));
  }

  private transformDecimals(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Prisma.Decimal) return Number(obj);
    if (Array.isArray(obj)) return obj.map((item) => this.transformDecimals(item));
    if (typeof obj === 'object' && obj.constructor === Object) {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = this.transformDecimals(obj[key]);
      }
      return result;
    }
    return obj;
  }
}
