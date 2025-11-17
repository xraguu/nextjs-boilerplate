export interface User {
  id: string; // internal UUID
  discordId: string; // from OAuth
  displayName: string;
  avatarUrl?: string;
  role: 'admin' | 'user'; // user role for permissions
  createdAt: Date;
}
