export class UserViewModal {
  constructor(
    public id: string,
    public login: string,
    public passwordHash: string,
    public email: string,
    public createdAt: string,
    public emailConfirmation: {
      confirmationCode: string;
      expirationDate: Date;
      isConfirmed: boolean;
    },
  ) {}
}
