-- CreateTable
CREATE TABLE "ManualStatsOverride" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "fpts" DOUBLE PRECISION NOT NULL,
    "avg" DOUBLE PRECISION NOT NULL,
    "last" DOUBLE PRECISION NOT NULL,
    "goals" INTEGER NOT NULL,
    "shots" INTEGER NOT NULL,
    "saves" INTEGER NOT NULL,
    "assists" INTEGER NOT NULL,
    "demos" INTEGER NOT NULL,
    "record" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ManualStatsOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManualStatsOverride_week_idx" ON "ManualStatsOverride"("week");

-- CreateIndex
CREATE INDEX "ManualStatsOverride_teamId_idx" ON "ManualStatsOverride"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "ManualStatsOverride_teamId_week_key" ON "ManualStatsOverride"("teamId", "week");
