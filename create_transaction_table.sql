-- Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fantasyLeagueId" TEXT NOT NULL,
    "fantasyTeamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "addTeamId" TEXT,
    "dropTeamId" TEXT,
    "tradeId" TEXT,
    "tradePartnerTeamId" TEXT,
    "tradePartnerGave" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "waiverClaimId" TEXT,
    "faabBid" INTEGER,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_fantasyLeagueId_fkey" FOREIGN KEY ("fantasyLeagueId") REFERENCES "FantasyLeague"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_fantasyTeamId_fkey" FOREIGN KEY ("fantasyTeamId") REFERENCES "FantasyTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Transaction_fantasyLeagueId_idx" ON "Transaction"("fantasyLeagueId");
CREATE INDEX IF NOT EXISTS "Transaction_fantasyTeamId_idx" ON "Transaction"("fantasyTeamId");
CREATE INDEX IF NOT EXISTS "Transaction_processedAt_idx" ON "Transaction"("processedAt");
