import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthDto, LoginOrEmailDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Throttle } from '@nestjs/throttler';
import { UserModel } from '../../users/schemas/users.schema';
import { User } from '../decorator/request.decorator';
import { Request, Response } from 'express';
import { JwtPairType } from '../constants';
import { Cookies } from '../decorator/cookies.decorator';
import {
  JwtTokenPairViewModel,
  TokensViewModel,
} from '../schemas/tokens.schemas';
import { Ip } from '../decorator/ip.decorator';
import { IpDto } from '../dto/api.dto';

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
  @Post('auth/login')
  async userLogin(
    @Body() loginOrEmail: LoginOrEmailDto,
    @User()
    user,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JwtPairType> {
    const ip = req.ip;
    const title = req.headers['user-agent'] || 'browser not found';
    const jwtPair = await this.authService.login(loginOrEmail, ip, title);
    res.cookie('refreshToken', jwtPair.refreshToken, {
      httpOnly: false,
      secure: false,
    });
    return jwtPair;
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
    const updateToken = await this.authService.refreshToken(
      cookies.refreshToken,
      ip,
    );
    res.cookie('refreshToken', updateToken.refreshToken, {
      httpOnly: false,
      secure: false,
    });
    return updateToken;
  }

  @Throttle(5, 10)
  @Post('auth/password-recovery')
  @HttpCode(204)
  async userPasswordRecovery(@Body('email') email: string) {
    return this.authService.passwordRecovery(email);
  }
}
