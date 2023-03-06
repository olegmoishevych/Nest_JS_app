import { IsIn } from 'class-validator';

export class LikeStatusDto {
  @IsIn(['Like', 'Dislike', 'None'])
  likeStatus: string;
}
