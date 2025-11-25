import { HttpException, HttpStatus } from '@nestjs/common';

export class NoLivesError extends HttpException {
  constructor(
    message: string = 'You have no lives remaining. Try again tomorrow.',
    public readonly nextReset: string,
    public readonly currentLives: number = 0,
  ) {
    super(
      {
        error: 'NO_LIVES',
        message,
        nextReset,
        currentLives,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
