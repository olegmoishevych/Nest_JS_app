import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../../users/service/users.service';
import { UserEntity } from '../domain/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(loginOrEmail: string, password: string): Promise<UserEntity> {
    const user = await this.usersService.checkUserCredentials(
      loginOrEmail,
      password,
    );
    console.log('user', user);
    if (user.banInfo.isBanned)
      throw new UnauthorizedException(['User is banned']);
    if (!user) throw new NotFoundException([]);
    return user;
  }
}
