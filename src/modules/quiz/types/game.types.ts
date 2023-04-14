export type AnswerStatuses = 'Correct' | 'Incorrect';
export type AnswerViewModel = {
  questionId: string;
  answerStatus: AnswerStatuses;
  addedAt: string;
};
export type Question = {
  id: string;
  body: string;
};
export type PlayerViewModel = {
  id: string;
  login: string;
};
// export type GameStatuses = 'PendingSecondPlayer' | 'Active' | 'Finished';
export type GamePlayerProgressViewModel = {
  answers: AnswerViewModel[];
  player: PlayerViewModel;
  score: number;
};
export type GamePairViewModel = {
  id: string;
  firstPlayerProgress: GamePlayerProgressViewModel;
  secondPlayerProgress: GamePlayerProgressViewModel | null;
  questions: Question[] | null;
  status: GameStatuses;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};

export enum GameStatuses {
  PENDING = 'PendingSecondPlayer',
  ACTIVE = 'Active',
  FINISHED = 'Finished',
}
