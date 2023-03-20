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
import { AuthService } from './service/auth.service';
import { Throttle } from '@nestjs/throttler';
import { MeViewModel, UserModel } from '../users/schemas/users.schema';
import { User } from './decorator/request.decorator';
import { Request, Response } from 'express';
import { Cookies } from './decorator/cookies.decorator';
import { JwtTokenPairViewModel } from './schemas/tokens.schemas';
import { Ip } from './decorator/ip.decorator';
import { IpDto } from './dto/api.dto';
import { RecoveryCodeModal } from './schemas/recoveryCode.schemas';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { RegistrationCommand } from './use-cases/registration.use-case';
import { ConfirmationCommand } from './use-cases/confirmation-use-case';
import { EmailResendingCommand } from './use-cases/registration-email-resending.use-case';
import { LoginCommand } from './use-cases/login.use-case';
import { UserEntity } from './domain/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    public authService: AuthService,
    private commandBus: CommandBus,
  ) {}

  @Throttle(5, 10)
  @Post('/registration')
  @HttpCode(204)
  async userRegistration(@Body() registrationDto: AuthDto): Promise<boolean> {
    return this.commandBus.execute(new RegistrationCommand(registrationDto));
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
    return this.authService.logout(cookies.refreshToken);
  }

  @Post('/refresh-token')
  @HttpCode(200)
  async userRefreshToken(
    @Cookies() cookies,
    @Ip() ip: IpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtTokenPairViewModel> {
    const updateToken = await this.authService.refreshToken(
      cookies.refreshToken,
      ip,
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
  async userPasswordRecovery(
    @Body('email') email: string,
  ): Promise<RecoveryCodeModal> {
    return this.authService.passwordRecovery(email);
  }

  @Throttle(5, 10)
  @Post('/new-password')
  @HttpCode(204)
  async userNewPassword(
    @Body() newPassword: NewPasswordDto,
  ): Promise<UserModel> {
    return this.authService.findUserByRecoveryCodeAndChangeNewPassword(
      newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getUser(@User() user): Promise<MeViewModel> {
    return { email: user.email, login: user.login, userId: user.id };
  }
}
