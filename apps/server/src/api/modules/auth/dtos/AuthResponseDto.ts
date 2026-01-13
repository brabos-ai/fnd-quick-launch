export class AuthResponseDto {
  accessToken!: string;
  refreshToken!: string;
  user!: {
    id: string;
    email: string;
    fullName: string;
    emailVerified: boolean;
    accountId: string;
  };
  session?: {
    id: string;
    expiresAt: Date;
  };
}
