export interface ImpersonateResponseDto {
  accessToken: string;
  sessionId: string;
  expiresAt: Date;
  targetUser: {
    id: string;
    email: string;
    name: string;
  };
}
