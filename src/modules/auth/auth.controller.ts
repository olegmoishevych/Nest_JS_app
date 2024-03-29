import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthDto, NewPasswordDto } from './dto/auth.dto';
import { Throttle } from '@nestjs/throttler';
import { User } from './decorator/request.decorator';
import { Request, Response } from 'express';
import { Cookies } from './decorator/cookies.decorator';
import { Ip } from './decorator/ip.decorator';
import { IpDto } from './dto/api.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './use-cases/registration.use-case';
import { ConfirmationCommand } from './use-cases/confirmation-use-case';
import { EmailResendingCommand } from './use-cases/registration-email-resending.use-case';
import { LoginCommand } from './use-cases/login.use-case';
import { UserEntity } from './domain/entities/user.entity';
import { LogoutCommand } from './use-cases/logout.user-case';
import { RefreshTokenCommand } from './use-cases/refreshToken.use-case';
import { PasswordRecoveryCommand } from './use-cases/password-recovery.use-case';
import { NewPasswordCommand } from './use-cases/new-password.use-case';

@Controller('auth')
export class AuthController {
  constructor(private commandBus: CommandBus) {}

  @Throttle(5, 10)
  @Post('/registration')
  @HttpCode(204)
  async userRegistration(@Body() dto: AuthDto): Promise<boolean> {
    return this.commandBus.execute(new RegistrationCommand(dto));
  }

  @Throttle(5, 10)
  @Post('/registration-confirmation')
  @HttpCode(204)
  async userRegistrationConfirmation(
    @Body('code') code: string,
  ): Promise<boolean> {
    return this.commandBus.execute(new ConfirmationCommand(code));
  }

  @Throttle(5, 10)
  @Post('/registration-email-resending')
  @HttpCode(204)
  async userRegistrationEmailResending(
    @Body('email') email: string,
  ): Promise<boolean> {
    return this.commandBus.execute(new EmailResendingCommand(email));
  }
  @UseGuards(LocalAuthGuard)
  @Throttle(5, 10)
  @HttpCode(200)
  @Post('/login')
  async userLogin(
    @User()
    user: UserEntity,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const ip = req.ip;
    const title = req.headers['user-agent'] || 'browser not found';
    const { accessToken, refreshToken } = await this.commandBus.execute(
      new LoginCommand(ip, title, user),
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: accessToken };
  }
  @Post('/logout')
  @HttpCode(204)
  async userLogout(@Cookies() cookies): Promise<boolean> {
    return this.commandBus.execute(new LogoutCommand(cookies.refreshToken));
  }

  @Post('/refresh-token')
  @HttpCode(200)
  async userRefreshToken(
    @Cookies() cookies,
    @Ip() ip: IpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const updateToken = await this.commandBus.execute(
      new RefreshTokenCommand(ip, cookies.refreshToken),
    );
    res.cookie('refreshToken', updateToken.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return updateToken;
  }

  @Throttle(5, 10)
  @Post('/password-recovery')
  @HttpCode(204)
  async userPasswordRecovery(@Body('email') email: string): Promise<boolean> {
    return this.commandBus.execute(new PasswordRecoveryCommand(email));
  }

  @Throttle(5, 10)
  @Post('/new-password')
  @HttpCode(204)
  async userNewPassword(@Body() dto: NewPasswordDto): Promise<UserEntity> {
    return this.commandBus.execute(new NewPasswordCommand(dto));
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getUser(
    @User() user: UserEntity,
  ): Promise<{ email: string; login: string; userId: string }> {
    return { email: user.email, login: user.login, userId: user.id };
  }
}
