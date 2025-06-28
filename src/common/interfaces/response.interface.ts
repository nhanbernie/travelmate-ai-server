export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
  timestamp: string;
}

export class ResponseBuilder {
  static success<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
  ): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }

  static error(
    message: string = 'Error',
    statusCode: number = 500,
    data: any = null,
  ): ApiResponse {
    return {
      success: false,
      data,
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    };
  }
}
