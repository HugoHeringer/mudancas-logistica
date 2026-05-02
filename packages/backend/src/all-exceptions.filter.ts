import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    console.error('=== UNHANDLED EXCEPTION ===');
    console.error(exception);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Erro interno do servidor';
    let campo: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const excResponse = exception.getResponse();

      if (typeof excResponse === 'string') {
        message = excResponse;
      } else if (typeof excResponse === 'object') {
        const obj = excResponse as any;
        if (Array.isArray(obj.message)) {
          // class-validator returns array of messages
          message = obj.message.join('; ');
        } else {
          message = obj.message || exception.message;
        }
        if (obj.campo) campo = obj.campo;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      ...(campo && { campo }),
      timestamp: new Date().toISOString(),
    });
  }
}
