import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from '../constants';
import { UsersRepository } from '../../users/repository/users.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepository: UsersRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.jwt_secret,
    });
  }
  async validate(payload: any) {
    const findUserById = await this.usersRepository.findUserById(
      payload.userId,
    );
    if (!findUserById) throw new UnauthorizedException();
    return findUserById;
  }
}
