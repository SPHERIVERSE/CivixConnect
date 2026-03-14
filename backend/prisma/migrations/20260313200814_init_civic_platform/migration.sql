-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'WORKER', 'CITIZEN', 'BUSINESS');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('MCQ', 'SUBJECTIVE');

-- CreateEnum
CREATE TYPE "public"."ReportType" AS ENUM ('illegal_dumping', 'open_toilet', 'dirty_toilet', 'overflow_dustbin', 'dead_animal', 'fowl', 'public_bin_request', 'public_toilet_request', 'POTHOLE', 'BROKEN_STREETLIGHT', 'ROAD_DAMAGE', 'WATER_LEAK', 'FALLEN_TREE', 'BROKEN_FOOTPATH');

-- CreateEnum
CREATE TYPE "public"."ReportStatus" AS ENUM ('pending', 'escalated', 'assigned', 'resolved', 'working');

-- CreateEnum
CREATE TYPE "public"."PostMediaType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."ReactionType" AS ENUM ('like', 'dislike');

-- CreateEnum
CREATE TYPE "public"."FacilityType" AS ENUM ('TOILET', 'BIN', 'WASTE_FACILITY');

-- CreateEnum
CREATE TYPE "public"."WasteType" AS ENUM ('PLASTIC', 'PAPER', 'METAL', 'GLASS', 'ORGANIC', 'ELECTRONIC', 'TEXTILE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('CIVIC_REPORT_STATUS', 'BID_ACCEPTED', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DriveStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."QuizStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('EARNED', 'SPENT');

-- CreateEnum
CREATE TYPE "public"."TransactionSource" AS ENUM ('COURSE_COMPLETION', 'REPORT_RESOLUTION', 'SUPPORT_VOTE', 'MARKETPLACE_SALE', 'VOUCHER_PURCHASE', 'QUIZ_COMPLETION', 'VOUCHER_CLAIM');

-- CreateEnum
CREATE TYPE "public"."VoucherStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REDEEMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profileImageUrl" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "age" INTEGER,
    "gender" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'CITIZEN',
    "totalXp" INTEGER NOT NULL DEFAULT 0,
    "cleanCoinBalance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "licenseNo" TEXT,
    "businessType" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityPost" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" "public"."PostMediaType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CommunityComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_polls" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "postId" TEXT NOT NULL,

    CONSTRAINT "community_polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."community_poll_votes" (
    "id" TEXT NOT NULL,
    "option" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,

    CONSTRAINT "community_poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityReaction" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "type" "public"."ReactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityReaction_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "public"."CommunityFollow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityFollow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "public"."CivicReport" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "public"."ReportType" NOT NULL,
    "imageUrl" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "public"."ReportStatus" NOT NULL DEFAULT 'pending',
    "supportCount" INTEGER NOT NULL DEFAULT 0,
    "oppositionCount" INTEGER NOT NULL DEFAULT 0,
    "resolvedImageUrl" TEXT,
    "resolvedNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "assignedToWorkerId" TEXT,

    CONSTRAINT "CivicReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CivicReportSupport" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "support" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CivicReportSupport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PublicFacility" (
    "id" TEXT NOT NULL,
    "type" "public"."FacilityType" NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "addedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicFacility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WasteWorkerLocation" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WasteWorkerLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "public"."NotificationType",

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WasteListing" (
    "id" TEXT NOT NULL,
    "wasteType" "public"."WasteType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "public"."ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "soldAt" TIMESTAMP(3),
    "sellerId" TEXT NOT NULL,
    "buyerId" TEXT,

    CONSTRAINT "WasteListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WasteBid" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "message" TEXT,
    "status" "public"."BidStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "listingId" TEXT NOT NULL,
    "bidderId" TEXT NOT NULL,

    CONSTRAINT "WasteBid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CSRFund" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "allocatedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "CSRFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CSRFundAllocation" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "purpose" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fundId" TEXT NOT NULL,

    CONSTRAINT "CSRFundAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityDrive" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."DriveStatus" NOT NULL DEFAULT 'UPCOMING',
    "targetParticipants" INTEGER,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "rewardAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "CommunityDrive_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommunityDriveParticipation" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rewardEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "driveId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "CommunityDriveParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AwarenessQuiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "questions" JSONB NOT NULL,
    "rewardAmount" DOUBLE PRECISION NOT NULL,
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cleanCoinReward" INTEGER NOT NULL DEFAULT 0,
    "targetRole" "public"."Role",
    "organizerId" TEXT NOT NULL,

    CONSTRAINT "AwarenessQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AwarenessQuizParticipation" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "answers" JSONB NOT NULL,
    "rewardEarned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AwarenessQuizParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reward" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "businessId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CleanCoinTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "source" "public"."TransactionSource" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "courseId" TEXT,
    "reportId" TEXT,
    "listingId" TEXT,
    "voucherId" TEXT,
    "quizId" TEXT,

    CONSTRAINT "CleanCoinTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Voucher" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cleanCoinCost" INTEGER NOT NULL,
    "discountAmount" DOUBLE PRECISION,
    "discountPercent" DOUBLE PRECISION,
    "terms" TEXT,
    "expiryDate" TIMESTAMP(3),
    "status" "public"."VoucherStatus" NOT NULL DEFAULT 'ACTIVE',
    "totalQuantity" INTEGER,
    "claimedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "businessId" TEXT NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VoucherClaim" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemedAt" TIMESTAMP(3),
    "isRedeemed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VoucherClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "public"."User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "public"."User"("role");

-- CreateIndex
CREATE INDEX "User_totalXp_idx" ON "public"."User"("totalXp");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "public"."User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "community_poll_votes_userId_pollId_key" ON "public"."community_poll_votes"("userId", "pollId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityReaction_userId_postId_key" ON "public"."CommunityReaction"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityFollow_followerId_followingId_key" ON "public"."CommunityFollow"("followerId", "followingId");

-- CreateIndex
CREATE INDEX "CivicReport_status_idx" ON "public"."CivicReport"("status");

-- CreateIndex
CREATE INDEX "CivicReport_createdById_idx" ON "public"."CivicReport"("createdById");

-- CreateIndex
CREATE INDEX "CivicReport_assignedToWorkerId_idx" ON "public"."CivicReport"("assignedToWorkerId");

-- CreateIndex
CREATE INDEX "CivicReport_createdAt_idx" ON "public"."CivicReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CivicReportSupport_reportId_userId_key" ON "public"."CivicReportSupport"("reportId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "WasteWorkerLocation_workerId_key" ON "public"."WasteWorkerLocation"("workerId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "public"."Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_reportId_idx" ON "public"."Notification"("reportId");

-- CreateIndex
CREATE INDEX "WasteListing_sellerId_idx" ON "public"."WasteListing"("sellerId");

-- CreateIndex
CREATE INDEX "WasteListing_buyerId_idx" ON "public"."WasteListing"("buyerId");

-- CreateIndex
CREATE INDEX "WasteListing_wasteType_idx" ON "public"."WasteListing"("wasteType");

-- CreateIndex
CREATE INDEX "WasteListing_status_idx" ON "public"."WasteListing"("status");

-- CreateIndex
CREATE INDEX "WasteListing_createdAt_idx" ON "public"."WasteListing"("createdAt");

-- CreateIndex
CREATE INDEX "WasteBid_listingId_idx" ON "public"."WasteBid"("listingId");

-- CreateIndex
CREATE INDEX "WasteBid_bidderId_idx" ON "public"."WasteBid"("bidderId");

-- CreateIndex
CREATE INDEX "WasteBid_status_idx" ON "public"."WasteBid"("status");

-- CreateIndex
CREATE INDEX "CSRFund_businessId_idx" ON "public"."CSRFund"("businessId");

-- CreateIndex
CREATE INDEX "CSRFundAllocation_fundId_idx" ON "public"."CSRFundAllocation"("fundId");

-- CreateIndex
CREATE INDEX "CommunityDrive_organizerId_idx" ON "public"."CommunityDrive"("organizerId");

-- CreateIndex
CREATE INDEX "CommunityDrive_status_idx" ON "public"."CommunityDrive"("status");

-- CreateIndex
CREATE INDEX "CommunityDrive_startDate_idx" ON "public"."CommunityDrive"("startDate");

-- CreateIndex
CREATE INDEX "CommunityDriveParticipation_driveId_idx" ON "public"."CommunityDriveParticipation"("driveId");

-- CreateIndex
CREATE INDEX "CommunityDriveParticipation_userId_idx" ON "public"."CommunityDriveParticipation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityDriveParticipation_driveId_userId_key" ON "public"."CommunityDriveParticipation"("driveId", "userId");

-- CreateIndex
CREATE INDEX "AwarenessQuiz_organizerId_idx" ON "public"."AwarenessQuiz"("organizerId");

-- CreateIndex
CREATE INDEX "AwarenessQuiz_status_idx" ON "public"."AwarenessQuiz"("status");

-- CreateIndex
CREATE INDEX "AwarenessQuiz_startDate_idx" ON "public"."AwarenessQuiz"("startDate");

-- CreateIndex
CREATE INDEX "AwarenessQuizParticipation_quizId_idx" ON "public"."AwarenessQuizParticipation"("quizId");

-- CreateIndex
CREATE INDEX "AwarenessQuizParticipation_userId_idx" ON "public"."AwarenessQuizParticipation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AwarenessQuizParticipation_quizId_userId_key" ON "public"."AwarenessQuizParticipation"("quizId", "userId");

-- CreateIndex
CREATE INDEX "Reward_businessId_idx" ON "public"."Reward"("businessId");

-- CreateIndex
CREATE INDEX "Reward_recipientId_idx" ON "public"."Reward"("recipientId");

-- CreateIndex
CREATE INDEX "CleanCoinTransaction_userId_idx" ON "public"."CleanCoinTransaction"("userId");

-- CreateIndex
CREATE INDEX "CleanCoinTransaction_createdAt_idx" ON "public"."CleanCoinTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "CleanCoinTransaction_source_idx" ON "public"."CleanCoinTransaction"("source");

-- CreateIndex
CREATE INDEX "Voucher_businessId_idx" ON "public"."Voucher"("businessId");

-- CreateIndex
CREATE INDEX "Voucher_status_idx" ON "public"."Voucher"("status");

-- CreateIndex
CREATE INDEX "Voucher_createdAt_idx" ON "public"."Voucher"("createdAt");

-- CreateIndex
CREATE INDEX "VoucherClaim_userId_idx" ON "public"."VoucherClaim"("userId");

-- CreateIndex
CREATE INDEX "VoucherClaim_voucherId_idx" ON "public"."VoucherClaim"("voucherId");

-- CreateIndex
CREATE INDEX "VoucherClaim_claimedAt_idx" ON "public"."VoucherClaim"("claimedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VoucherClaim_userId_voucherId_key" ON "public"."VoucherClaim"("userId", "voucherId");

-- AddForeignKey
ALTER TABLE "public"."CommunityPost" ADD CONSTRAINT "CommunityPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityComment" ADD CONSTRAINT "CommunityComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityComment" ADD CONSTRAINT "CommunityComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_polls" ADD CONSTRAINT "community_polls_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_poll_votes" ADD CONSTRAINT "community_poll_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."community_poll_votes" ADD CONSTRAINT "community_poll_votes_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "public"."community_polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityReaction" ADD CONSTRAINT "CommunityReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityReaction" ADD CONSTRAINT "CommunityReaction_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityFollow" ADD CONSTRAINT "CommunityFollow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityFollow" ADD CONSTRAINT "CommunityFollow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CivicReport" ADD CONSTRAINT "CivicReport_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CivicReport" ADD CONSTRAINT "CivicReport_assignedToWorkerId_fkey" FOREIGN KEY ("assignedToWorkerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CivicReportSupport" ADD CONSTRAINT "CivicReportSupport_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."CivicReport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CivicReportSupport" ADD CONSTRAINT "CivicReportSupport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WasteWorkerLocation" ADD CONSTRAINT "WasteWorkerLocation_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "public"."CivicReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WasteListing" ADD CONSTRAINT "WasteListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WasteListing" ADD CONSTRAINT "WasteListing_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WasteBid" ADD CONSTRAINT "WasteBid_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "public"."WasteListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WasteBid" ADD CONSTRAINT "WasteBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CSRFund" ADD CONSTRAINT "CSRFund_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CSRFundAllocation" ADD CONSTRAINT "CSRFundAllocation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "public"."CSRFund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityDrive" ADD CONSTRAINT "CommunityDrive_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityDriveParticipation" ADD CONSTRAINT "CommunityDriveParticipation_driveId_fkey" FOREIGN KEY ("driveId") REFERENCES "public"."CommunityDrive"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommunityDriveParticipation" ADD CONSTRAINT "CommunityDriveParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AwarenessQuiz" ADD CONSTRAINT "AwarenessQuiz_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AwarenessQuizParticipation" ADD CONSTRAINT "AwarenessQuizParticipation_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."AwarenessQuiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AwarenessQuizParticipation" ADD CONSTRAINT "AwarenessQuizParticipation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reward" ADD CONSTRAINT "Reward_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CleanCoinTransaction" ADD CONSTRAINT "CleanCoinTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherClaim" ADD CONSTRAINT "VoucherClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VoucherClaim" ADD CONSTRAINT "VoucherClaim_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."Voucher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
