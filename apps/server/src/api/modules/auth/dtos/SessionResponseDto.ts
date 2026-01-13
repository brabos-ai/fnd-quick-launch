export class SessionResponseDto {
  id!: string;
  deviceName!: string | null;
  ipAddress!: string;
  lastActivityAt!: Date;
  createdAt!: Date;
}
