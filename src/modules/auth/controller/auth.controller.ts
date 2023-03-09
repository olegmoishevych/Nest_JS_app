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
import { AuthDto, LoginOrEmailDto, NewPasswordDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Throttle } from '@nestjs/throttler';
import { MeViewModel, UserModel } from '../../users/schemas/users.schema';
import { User } from '../decorator/request.decorator';
import { Request, Response } from 'express';
import { Cookies } from '../decorator/cookies.decorator';
import {
  JwtTokenPairViewModel,
  TokensViewModel,
} from '../schemas/tokens.schemas';
import { Ip } from '../decorator/ip.decorator';
import { IpDto } from '../dto/api.dto';
import { RecoveryCodeModal } from '../schemas/recoveryCode.schemas';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AccessTokenModal } from '../schemas/auth.schemas';

@Controller('api')
export class AuthController {
  constructor(public authService: AuthService) {}

  @Throttle(5, 10)
  @Post('auth/registration')
  @HttpCode(204)
  async userRegistration(@Body() registrationDto: AuthDto): Promise<UserModel> {
    return this.authService.userRegistration(registrationDto);
  }

  @Throttle(5, 10)
  @Post('auth/registration-confirmation')
  @HttpCode(204)
  async userRegistrationConfirmation(
    @Body('code') code: string,
  ): Promise<UserModel> {
    return this.authService.userRegistrationConfirmation(code);
  }

  @Throttle(5, 10)
  @Post('auth/registration-email-resending')
  @HttpCode(204)
  async userRegistrationEmailResending(
    @Body('email') email: string,
  ): Promise<boolean> {
    return this.authService.userRegistrationEmailResending(email);
  }

  @Throttle(5, 10)
  @HttpCode(200)
  @Post('auth/login')
  async userLogin(
    @Body() loginOrEmail: LoginOrEmailDto,
    @User()
    user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenModal> {
    const ip = req.ip;
    const title = req.headers['user-agent'] || 'browser not found';
    const { accessToken, refreshToken } = await this.authService.login(
      loginOrEmail,
      ip,
      title,
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return { accessToken: accessToken };
  }

  @Post('auth/logout')
  @HttpCode(204)
  async userLogout(@Cookies() cookies): Promise<TokensViewModel> {
    return this.authService.logout(cookies.refreshToken);
  }

  @Post('auth/refresh-token')
  @HttpCode(200)
  async userRefreshToken(
    @Cookies() cookies,
    @Ip() ip: IpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtTokenPairViewModel> {
    console.log('cookies', cookies);
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
  @Post('auth/password-recovery')
  @HttpCode(204)
  async userPasswordRecovery(
    @Body('email') email: string,
  ): Promise<RecoveryCodeModal> {
    return this.authService.passwordRecovery(email);
  }

  @Throttle(5, 10)
  @Post('auth/new-password')
  @HttpCode(204)
  async userNewPassword(
    @Body() newPassword: NewPasswordDto,
  ): Promise<UserModel> {
    return this.authService.findUserByRecoveryCodeAndChangeNewPassword(
      newPassword,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('auth/me')
  async getUser(@User() user): Promise<MeViewModel> {
    return { email: user.email, login: user.login, userId: user.id };
  }
}
