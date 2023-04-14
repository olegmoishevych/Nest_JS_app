import { Injectable } from '@nestjs/common';
import { PlayerStatisticsEntity } from '../domain/entites/player-statistics.entity';
import { Answer } from '../domain/entites/player.entity';
import {
  AnswerViewModel,
  GamePairViewModel,
  GamePlayerProgressViewModel,
} from './game.types';
import { GameEntity } from '../domain/entites/game.entity';
import { QuizQuestionEntity } from '../domain/entites/quiz-question.entity';

@Injectable()
export class ViewModelMapper {
  constructor() {}

  getQuizQuestionViewModel(question: QuizQuestionEntity) {
    return {
      id: question.id.toString(),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
    };
  }

  getGameViewModel(game: GameEntity): GamePairViewModel {
    const firstPlayerProgress: GamePlayerProgressViewModel = {
      answers: game.players[0].answers.map(this.getAnswerViewModel),
      score: game.players[0].score,
      player: {
        id: game.players[0].userId.toString(),
        login: game.players[0].user.login,
      },
    };
    const secondPlayerProgress: GamePlayerProgressViewModel =
      game.players.length === 2
        ? {
            answers: game.players[1].answers.map(this.getAnswerViewModel),
            score: game.players[1].score,
            player: {
              id: game.players[1].userId.toString(),
              login: game.players[1].user.login,
            },
          }
        : null;
    return {
      id: game.id.toString(),
      firstPlayerProgress,
      secondPlayerProgress,
      status: game.status,
      startGameDate: game.startGameDate
        ? game.startGameDate.toISOString()
        : null,
      pairCreatedDate: game.pairCreatedDate.toISOString(),
      finishGameDate: game.finishGameDate
        ? game.finishGameDate.toISOString()
        : null,
      questions: game.questions
        ? game.questions.map((q) => ({ id: q.id.toString(), body: q.body }))
        : null,
    };
  }

  getAnswerViewModel(answer: Answer): AnswerViewModel {
    return {
      answerStatus: answer.answerStatus,
      addedAt: answer.addedAt.toISOString(),
      questionId: answer.questionId.toString(),
    };
  }

  getPlayerStatsViewModel(stats: PlayerStatisticsEntity) {
    return {
      sumScore: stats.sumScore,
      // avgScores: +(stats.sumScore / stats.gamesCount).toFixed(2),
      avgScores: +(+stats.avgScores).toFixed(2),
      gamesCount: stats.gamesCount,
      winsCount: stats.winsCount,
      lossesCount: stats.lossesCount,
      drawsCount: stats.drawsCount,
    };
  }

  getTopPlayerViewModel(stats: PlayerStatisticsEntity) {
    return {
      ...this.getPlayerStatsViewModel(stats),
      player: { id: stats.user.id.toString(), login: stats.user.login },
    };
  }
}
