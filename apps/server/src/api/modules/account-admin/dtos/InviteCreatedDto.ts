export interface InviteCreatedDto {
  id: string;
  email: string;
  expiresAt: Date;
  inviteUrl: string;
}
