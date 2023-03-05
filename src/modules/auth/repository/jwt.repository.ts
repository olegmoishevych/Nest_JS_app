import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Tokens,
  TokensDocument,
  TokensViewModel,
} from '../schemas/tokens.schemas';

@Injectable()
export class JwtRepository {
  constructor(
    @InjectModel(Tokens.name)
    private readonly tokensModel: Model<TokensDocument>,
  ) {}
  async addRefreshTokenInBlackList(
    refreshToken: string,
  ): Promise<TokensViewModel> {
    return this.tokensModel.create({ refreshToken });
  }
  async findRefreshTokenInBlackList(refreshToken: string): Promise<string> {
    return this.tokensModel.findOne({ refreshToken });
  }
}
