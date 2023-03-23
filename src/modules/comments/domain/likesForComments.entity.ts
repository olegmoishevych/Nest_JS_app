// import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
// import { CommentatorInfoEntity } from "./commentatorInfo.entity";
//
// @Entity('LikesForComments')
// export class LikesForCommentsEntity {
//   @PrimaryGeneratedColumn()
//   id: string;
//   @Column()
//   isUserBanned: boolean;
//   @Column()
//   content: string;
//   @Column()
//   postId: string;
//   @ManyToOne(() => CommentatorInfoEntity, (c) => c.comments, {
//     eager: true,
//     cascade: true,
//     onDelete: 'CASCADE',
//   })
//   @JoinColumn()
//   commentatorInfo: CommentatorInfoEntity;
//   @Column()
//   createdAt: string;
//   @OneToMany(()=>)
//   @JoinColumn()
//   likesInfo: any
// }
