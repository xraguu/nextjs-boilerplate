# Database Export/Import Instructions

## Exported Data

This folder contains exported data from the following tables:
- **MLETeam.json** - 128 MLE Teams
- **MLEPlayer.json** - 5,671 MLE Players
- **PlayerHistoricalStats.json** - 6,600 Player Historical Stats

## How to Import to Digital Ocean Database

1. **Copy the exports folder** to your Digital Ocean server or local machine with access to the Digital Ocean database

2. **Update your .env file** to point to the Digital Ocean database:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

3. **Run Prisma migrations** to ensure the schema is up to date:
   ```bash
   npx prisma migrate deploy
   # or
   npx prisma db push
   ```

4. **Run the import script**:
   ```bash
   npx tsx scripts/import-data.ts
   ```

## Alternative: SQL Import

If you prefer to use SQL, you can also import the data using PostgreSQL's COPY command or psql:

1. Convert JSON to SQL INSERT statements (you can use online tools or write a script)
2. Run the SQL file against your Digital Ocean database

## Verification

After importing, verify the data:
```bash
npx prisma studio
```

Or check row counts:
```sql
SELECT COUNT(*) FROM "MLETeam";
SELECT COUNT(*) FROM "MLEPlayer";
SELECT COUNT(*) FROM "PlayerHistoricalStats";
```

## Notes

- The import script uses `upsert` to avoid duplicate key errors
- If you need to re-import, the script will update existing records
- Make sure your Digital Ocean database has the correct schema before importing
