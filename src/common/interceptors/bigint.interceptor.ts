import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class BigIntInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.serializeBigInts(data)),
    );
  }

  private serializeBigInts(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.serializeBigInts(item));
    }

    if (typeof data === 'object') {
      const newObj = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          if (typeof value === 'bigint') {
            newObj[key] = value.toString();
          } else {
            newObj[key] = this.serializeBigInts(value);
          }
        }
      }
      return newObj;
    }

    return data;
  }
}
