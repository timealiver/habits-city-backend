import { Injectable } from '@nestjs/common';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MESSAGES } from '../utils/localeMessages';  // Импортируем локализации
import { STATUS_CODES } from '../utils/statusCodes';  // Импортируем коды статусов
import { ApiResponse } from 'src/interfaces/response.interface';

@Injectable()
export class LocalizationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Получаем локаль из заголовка
    const locale = request.headers['x-locale-language'] || 'en';  // По умолчанию 'en'

    return next.handle().pipe(
      tap((data: ApiResponse) => {
        // Определение HTTP статуса на основе кода ошибки или успеха
        const httpStatus = STATUS_CODES[data.code] || 200;  // Если кода нет, статус по умолчанию 200 (OK)

        // Если это ошибка, локализуем сообщение
        if (data?.status === 'error' && data?.code) {
          const errorMessage = MESSAGES[locale]?.error[data.code] || 'Unknown error';
          data.message = errorMessage;
        } else if (data?.status === 'success' && data?.code) {
          // Если это успешный ответ, локализуем сообщение
          const successMessage = MESSAGES[locale]?.success[data.code] || 'Operation successful';
          data.message = successMessage;
        }

        // Устанавливаем статус ответа
        context.switchToHttp().getResponse().status(httpStatus);
        return data; // Отправляем локализованный ответ с нужным статусом
      }),
    );
  }
}
