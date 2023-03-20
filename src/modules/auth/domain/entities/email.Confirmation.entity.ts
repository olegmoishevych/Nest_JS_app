import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailConfirmation } from '../../../users/schemas/users.schema';
import { UserEntity } from './user.entity';

@Entity('EmailConfirmation')
export class EmailConfirmationEntity {
  @PrimaryGeneratedColumn()
  id: string;
  @Column()
  confirmationCode: string;
  @Column()
  expirationDate: Date;
  @Column()
  isConfirmed: boolean;
  @OneToOne(() => UserEntity, (user) => user.emailConfirmation)
  user: UserEntity;
}
