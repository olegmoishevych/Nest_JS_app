import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from '../constants';
import { UsersSqlRepository } from '../../users/repository/users.sql.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepository: UsersSqlRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.jwt_secret,
    });
  }

  async validate(payload: any) {
    // console.log('payload', payload);
    const user = await this.usersRepository.findUserById(payload.userId);
    // console.log('findUserById', findUserById);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
