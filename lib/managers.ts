// lib/managers.ts
export type Manager = {
  name: string;      // Manager display name
  team: string;      // Roster name
  slug: string;      // URL segment e.g., "nick-owls"
};

// Helper to slugify names
const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")      // spaces → dashes
    .replace(/[^\w-]+/g, "");  // remove punctuation

// TODO: Replace with real data later (DB/API).
export const MANAGERS: Manager[] = [
  { name: "xenn",   team: "the creator",  slug: "ava-skyhawks" },
  { name: "Rover",   team: "main bull guy", slug: "ben-thundercats" },
  { name: "SkyGuy",  team: "mian flames guy",  slug: "cruz-night-owls" },
  { name: "Shark",   team: "almost main blizzard guy",   slug: "dee-marauders" },
  { name: "Crazy",  team: "hes crazy",      slug: "elle-comets" },
  { name: "BigCountry",  team: "ABC",  slug: "finn-railriders" },
  { name: "Quark",   team: "bad at sheets",    slug: "gia-turbines" },
  { name: "Liv",  team: "my boss",     slug: "hugh-eclipse" },
  { name: "Ant",  team: "trackmania",   slug: "isla-stingrays" },
  { name: "chawie",   team: "idk",    slug: "jax-cyclones" },
].map(m => ({
  ...m,
  slug: `${slugify(m.name)}-${slugify(m.team)}`,
}));
