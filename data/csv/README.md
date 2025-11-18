# CSV Data Import

This directory contains CSV files for importing MLE data into the fantasy platform.

## Required Files

Place the following CSV files from the `imports/` directory into this `data/csv/` directory:

### MLE Data (not Fantasy League data)
**Note:** MLE teams/players are separate from fantasy managers/leagues. Fantasy managers are users who sign in with Discord.

1. **teams.csv** - MLE teams and leagues data
   - All columns imported (Conference, Division, Franchise, Code, Colors, etc.)
   - Used to create MLELeague and MLETeam records

2. **players.csv** - MLE players data
   - **Used columns:** `member_id, skill_group, franchise, Franchise Staff Position, slot`
   - Used to create MLEPlayer records

3. **fixtures.csv** - Match fixtures
   - **Used columns:** `fixture_id, match_group_id, home, away`
   - Used to create Fixture records

4. **matches.csv** - Individual matches
   - **Used columns:** `match_id, fixture_id, match_group_id, home, away, league, game_mode, home_wins, away_wins`
   - Used to create Match records

5. **rounds_s18.csv** - Season 18 rounds data
   - **Used columns:** `match_id, round_id, Home, Home Goals, Away, Away Goals`
   - Used to map matches to rounds and calculate game results

6. **match_groups.csv** - Match group information
   - **Used columns:** `match_group_id, match_group_title, parent_group_title`
   - Used for organizing matches into groups

7. **role_usages.csv** - Player position usage (2s vs 3s)
   - **Used columns:** `doubles_uses, standard_uses, season_number, team_name, league, role`
   - Used to create RoleUsage records

8. **player_stats_s18.csv** - Player match statistics
   - **Used columns:** `member_id, team_name, skill_group, gamemode, match_id, round_id, gpi, goals, saves, shots, assists, goals_against, shots_against, demos_inflicted, demos_taken`
   - Used to create PlayerMatchStats records

9. **historicalAggregatedPlayerStats.csv** - Historical player statistics
   - **Used columns:** `name, member_id, gamemode, games_played, sprocket_rating, total_goals, total_saves, total_shots, total_assists, total_demos_inflicted, total_demos_taken`
   - Used to create PlayerHistoricalStats records

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
