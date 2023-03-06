import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (username, password) => {
    if (username === 'admin' && password === 'qwerty') {
      return { ok: 'OK' };
    }
    throw new UnauthorizedException();
  };
}
