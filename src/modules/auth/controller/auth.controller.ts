import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import { AuthDto, LoginOrEmailDto } from '../dto/auth.dto';
import { AuthService } from '../service/auth.service';
import { Throttle } from '@nestjs/throttler';
import { UserModel } from '../../users/schemas/users.schema';
import { User } from '../decorator/request.decorator';
import { Request, Response } from 'express';
import { JwtPairType, loginOrEmailType } from '../constants';
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
      httpOnly: true,
      secure: true,
    });
    return jwtPair;
  }
}
