export interface User {
  id: string; // internal UUID
  discordId: string; // from OAuth
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
}
