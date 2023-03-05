import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tokens, TokensDocument } from '../schemas/tokens.schemas';

@Injectable()
export class JwtRepository {
  constructor(
    @InjectModel(Tokens.name)
    private readonly tokensModel: Model<TokensDocument>,
  ) {}
  async createRefreshTokenInBlackList(refreshToken: string) {
    return this.tokensModel.create({ refreshToken });
  }
}
