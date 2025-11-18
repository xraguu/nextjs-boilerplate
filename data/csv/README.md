# CSV Data Import

This directory contains CSV files for importing MLE data into the fantasy platform.

## Required Files

Place the following CSV files in this directory:

1. **teams.csv** - MLE teams and leagues data
   - Columns: id, name, league, slug, logoPath, primaryColor, secondaryColor, colorHex, colorHexTwo

2. **players.csv** - MLE players data
   - Columns: id, name, teamId

3. **fixtures.csv** - Match fixtures
   - Columns: id, date

4. **matches.csv** - Individual matches
   - Columns: id, fixtureId, roundId, matchGroupId, homeTeamId, awayTeamId, scheduledDate

5. **rounds_s18.csv** - Season 18 rounds data
   - Used to map matches to fantasy weeks

6. **match_groups.csv** - Match group information
   - Used for organizing matches

7. **role_usages.csv** - Player position usage
   - Columns: playerId, role, gamesPlayed

8. **player_stats_s18.csv** - Player match statistics
   - Columns: playerId, matchId, goals, shots, saves, assists, demosInflicted, demosTaken, sprocketRating

9. **historicalAggregatedPlayerStats.csv** - Historical player statistics
   - Columns: playerId, totalGoals, totalShots, totalSaves, totalAssists, totalDemos, avgSR, gamesPlayed

## Running the Import

After placing all CSV files in this directory, run:

```bash
npm run import:csv
```

## Import Order

The script imports data in the following order to maintain referential integrity:

1. Leagues and Teams
2. Players
3. Fixtures
4. Matches
5. Role Usages
6. Player Match Stats
7. Historical Player Stats

## Notes

- The script uses upsert operations, so it's safe to run multiple times
- Missing CSV files will be skipped with a warning
- Invalid data rows will be logged but won't stop the import
- Fantasy weeks are calculated automatically based on match dates
