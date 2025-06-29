import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetIpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    // Try to get real IP from various headers
    const forwarded = request.headers['x-forwarded-for'];
    const realIp = request.headers['x-real-ip'];
    const cfConnectingIp = request.headers['cf-connecting-ip'];

    let clientIp =
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip;

    // Handle forwarded headers
    if (forwarded) {
      clientIp = forwarded.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp;
    } else if (cfConnectingIp) {
      clientIp = cfConnectingIp;
    }

    // Remove IPv6 prefix if present
    if (clientIp && clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substring(7);
    }

    return clientIp || '127.0.0.1';
  },
);

export const GetUserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'] || 'Unknown';
  },
);
