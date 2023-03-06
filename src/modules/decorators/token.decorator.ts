import { createParamDecorator, ExecutionContext, Inject } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { JWT } from '../auth/constants';
import { UsersRepository } from '../users/repository/users.repository';

export const Token = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
    const injectYourService = Inject(UsersRepository);
    const request = ctx.switchToHttp().getRequest();
    const headers = request.headers.authorization;
    if (!headers) return;

    const token = headers.split(' ')[1];

    try {
      const result: any = jwt.verify(token, JWT.jwt_secret);

      return result.userId;
    } catch (error) {
      return null;
    }
  },
);
