-- AlterTable
ALTER TABLE "public"."CivicReport" ADD COLUMN     "aiConfidence" DOUBLE PRECISION,
ADD COLUMN     "aiDetectedType" "public"."ReportType",
ADD COLUMN     "aiFlaggedAsSpam" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "aiPriority" TEXT,
ADD COLUMN     "aiSeverityScore" INTEGER,
ADD COLUMN     "aiSummary" TEXT,
ADD COLUMN     "canonicalReportId" TEXT,
ADD COLUMN     "duplicateCount" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "public"."CivicReport" ADD CONSTRAINT "CivicReport_canonicalReportId_fkey" FOREIGN KEY ("canonicalReportId") REFERENCES "public"."CivicReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;
