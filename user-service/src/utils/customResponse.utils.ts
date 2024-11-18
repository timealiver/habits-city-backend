import { ApiResponse } from 'src/interfaces/response.interface';
export function customResponse(
  status: 'success'| 'error',
  code: string,
  data: any = null  // Опциональные данные
): ApiResponse {
  // Формируем объект ответа
  const response: ApiResponse = {
    status,
    code,
    message: '',  // Сообщение будет локализовано в интерцепторе
    data,
  };
  return response;
}
