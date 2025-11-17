import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Discord,
  ],
  callbacks: {
    async jwt({ token, profile }) {
      // Add Discord ID and role to JWT token
      if (profile) {
        token.discordId = profile.id;

        // Check if user is admin based on Discord ID
        const adminIds = process.env.ADMIN_DISCORD_IDS?.split(',') || [];
        token.role = adminIds.includes(profile.id as string) ? 'admin' : 'user';
      }
      return token;
    },
    async session({ session, token }) {
      // Add Discord ID and role to session
      if (session.user) {
        session.user.discordId = token.discordId as string;
        session.user.role = token.role as 'admin' | 'user';
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
});
