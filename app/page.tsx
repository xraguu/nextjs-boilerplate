// app/page.tsx
import Link from "next/link";
// import { getServerSession } from "next-auth";
// import { db } from "@/lib/db";

export default async function HomePage() {
  // const session = await getServerSession(authOptions);
  // const userId = session?.user.id;

  // const leagues = await db.league.findMany({
  //   where: { members: { some: { userId } } },
  //   select: { id: true, name: true },
  // });

  const leagues: { id: string; name: string }[] = []; // placeholder

  return (
    <main className="min-h-screen flex flex-col items-center py-10">
      <h1 className="text-4xl font-bold mb-6">RL Fantasy</h1>

      <section className="w-full max-w-xl">
        <h2 className="text-xl font-semibold mb-3">Your Leagues</h2>
        {leagues.length === 0 ? (
          <p>Your leagues will show up here once you’re added.</p>
        ) : (
          <ul className="space-y-2">
            {leagues.map((league) => (
              <li key={league.id}>
                <Link href={`/leagues/${league.id}`}>
                  {league.name}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
