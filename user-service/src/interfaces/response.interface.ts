export interface ApiResponse {
    status: 'success' | 'error';
    code: string;
    message: string;
    data: (string | number | object)[];
  }