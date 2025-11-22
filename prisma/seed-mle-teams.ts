import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// League data
const LEAGUES = [
  {
    id: "PL",
    name: "Premier League",
    colorHex: "#e2b22d",
    colorHexTwo: "#e3cd8f",
  },
  {
    id: "ML",
    name: "Master League",
    colorHex: "#d10057",
    colorHexTwo: "#c97799",
  },
  {
    id: "CL",
    name: "Champion League",
    colorHex: "#7e55ce",
    colorHexTwo: "#a999c9",
  },
  {
    id: "AL",
    name: "Academy League",
    colorHex: "#0085fa",
    colorHexTwo: "#73bdff",
  },
  {
    id: "FL",
    name: "Foundation League",
    colorHex: "#4ebfecff",
    colorHexTwo: "#b0e1f5",
  },
];

// Team franchise primary colors
const TEAM_PRIMARY_COLORS: Record<string, string> = {
  "Aviators": "#006847",
  "Bears": "#62b6fe",
  "Blizzard": "#385470",
  "Bulls": "#c30000",
  "Comets": "#2db4e3",
  "Demolition": "#148c32",
  "Dodgers": "#041e42",
  "Ducks": "#00788c",
  "Eclipse": "#261447",
  "Elite": "#572a84",
  "Express": "#00254c",
  "Flames": "#c92a06",
  "Foxes": "#ea6409",
  "Hawks": "#c30000",
  "Hive": "#ffa000",
  "Hurricanes": "#005030",
  "Jets": "#0a2b58",
  "Knights": "#b20000",
  "Lightning": "#002868",
  "Outlaws": "#981821",
  "Pandas": "#006100",
  "Pirates": "#333739",
  "Puffins": "#ec2c0d",
  "Rhinos": "#7d7d7d",
  "Sabres": "#f36a22",
  "Shadow": "#333739",
  "Sharks": "#329393",
  "Spartans": "#7b1515",
  "Spectre": "#58427c",
  "Tyrants": "#98012e",
  "Wizards": "#0066b2",
  "Wolves": "#8ebae3",
};

// Team franchise secondary colors
const TEAM_SECONDARY_COLORS: Record<string, string> = {
  "Aviators": "#b7b7b7",
  "Bears": "#a3bad2",
  "Blizzard": "#a3bad2",
  "Bulls": "#111111",
  "Comets": "#f6518d",
  "Demolition": "#fdc622",
  "Dodgers": "#e7e9ea",
  "Ducks": "#ffd100",
  "Eclipse": "#ff6c11",
  "Elite": "#ea9300",
  "Express": "#eeb311",
  "Flames": "#f6c432",
  "Foxes": "#ffffff",
  "Hawks": "#0199b5",
  "Hive": "#111111",
  "Hurricanes": "#f47321",
  "Jets": "#c7102e",
  "Knights": "#8e8e8e",
  "Lightning": "#ffffff",
  "Outlaws": "#231c09",
  "Pandas": "#111111",
  "Pirates": "#ffffff",
  "Puffins": "#9bf9ff",
  "Rhinos": "#d9d9d9",
  "Sabres": "#111111",
  "Shadow": "#d3bc8d",
  "Sharks": "#f36a24",
  "Spartans": "#ffb612",
  "Spectre": "#4dcf74",
  "Tyrants": "#c4a87d",
  "Wizards": "#fdb927",
  "Wolves": "#221c35",
};

// League team names
const LEAGUE_TEAM_NAMES: Record<string, string[]> = {
  PL: [
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Express",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Rhinos",
    "Shadow",
    "Spartans",
    "Wolves",
  ],
  ML: [
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Express",
    "Flames",
    "Foxes",
    "Hawks",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Pirates",
    "Puffins",
    "Rhinos",
    "Sabres",
    "Shadow",
    "Sharks",
    "Spartans",
    "Spectre",
    "Tyrants",
    "Wizards",
    "Wolves",
  ],
  CL: [
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Express",
    "Flames",
    "Foxes",
    "Hawks",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Pirates",
    "Puffins",
    "Rhinos",
    "Sabres",
    "Shadow",
    "Sharks",
    "Spartans",
    "Spectre",
    "Tyrants",
    "Wizards",
    "Wolves",
  ],
  AL: [
    "Aviators",
    "Bears",
    "Blizzard",
    "Bulls",
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Express",
    "Flames",
    "Foxes",
    "Hawks",
    "Hive",
    "Hurricanes",
    "Jets",
    "Knights",
    "Lightning",
    "Outlaws",
    "Pandas",
    "Pirates",
    "Puffins",
    "Rhinos",
    "Sabres",
    "Shadow",
    "Sharks",
    "Spartans",
    "Spectre",
    "Tyrants",
    "Wizards",
    "Wolves",
  ],
  FL: [
    "Comets",
    "Demolition",
    "Dodgers",
    "Ducks",
    "Eclipse",
    "Elite",
    "Flames",
    "Foxes",
    "Hawks",
    "Pirates",
    "Puffins",
    "Sabres",
    "Sharks",
    "Spectre",
    "Tyrants",
    "Wizards",
  ],
};

function kebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function buildTeamId(leagueId: string, baseName: string): string {
  const normalized = baseName.replace(/\s+/g, "");
  return `${leagueId.toLowerCase()}${normalized}`;
}

function buildTeamSlug(leagueId: string, baseName: string): string {
  const team = kebabCase(baseName);
  return `${leagueId}-${team}`;
}

function buildLogoPath(leagueId: string, baseName: string): string {
  const slug = buildTeamSlug(leagueId, baseName);
  return `/logos/${slug}.png`;
}

async function main() {
  console.log("🌱 Starting seed: MLE Leagues and Teams");

  // Step 1: Seed MLELeague
  console.log("\n📊 Seeding MLELeague...");
  for (const league of LEAGUES) {
    await prisma.mLELeague.upsert({
      where: { id: league.id },
      update: {
        name: league.name,
        colorHex: league.colorHex,
        colorHexTwo: league.colorHexTwo,
      },
      create: {
        id: league.id,
        name: league.name,
        colorHex: league.colorHex,
        colorHexTwo: league.colorHexTwo,
      },
    });
    console.log(`  ✓ ${league.id} - ${league.name}`);
  }

  // Step 2: Seed MLETeam
  console.log("\n🏆 Seeding MLETeam...");
  let totalTeams = 0;

  for (const leagueId of Object.keys(LEAGUE_TEAM_NAMES)) {
    console.log(`\n  ${leagueId}:`);
    const teamNames = LEAGUE_TEAM_NAMES[leagueId];

    for (const teamName of teamNames) {
      const id = buildTeamId(leagueId, teamName);
      const slug = buildTeamSlug(leagueId, teamName);
      const logoPath = buildLogoPath(leagueId, teamName);
      const primaryColor = TEAM_PRIMARY_COLORS[teamName] || "#ffffff";
      const secondaryColor = TEAM_SECONDARY_COLORS[teamName] || "#ffffff";

      await prisma.mLETeam.upsert({
        where: { id },
        update: {
          name: teamName,
          leagueId,
          slug,
          logoPath,
          primaryColor,
          secondaryColor,
        },
        create: {
          id,
          name: teamName,
          leagueId,
          slug,
          logoPath,
          primaryColor,
          secondaryColor,
        },
      });

      console.log(`    ✓ ${id} (${teamName})`);
      totalTeams++;
    }
  }

  console.log(`\n✅ Seed complete! Added ${LEAGUES.length} leagues and ${totalTeams} teams.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
