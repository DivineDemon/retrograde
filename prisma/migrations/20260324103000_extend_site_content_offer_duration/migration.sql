-- Create enum for limited-offer duration strategy.
CREATE TYPE "OfferDurationMode" AS ENUM ('TIME', 'CAPACITY');

-- Add editable singleton site content table.
CREATE TABLE "SiteContent" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "mangaSessionLabel" TEXT NOT NULL,
    "mangaSessionHeadline" TEXT NOT NULL,
    "mangaSessionDescription" TEXT NOT NULL,
    "locationLabel" TEXT NOT NULL,
    "locationAddress" TEXT NOT NULL,
    "hoursLineOne" TEXT NOT NULL,
    "hoursLineTwo" TEXT NOT NULL,
    "directionsUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteContent_pkey" PRIMARY KEY ("id")
);

-- Extend limited offers to support time- and capacity-based duration.
ALTER TABLE "LimitedOffer"
ADD COLUMN "durationMode" "OfferDurationMode" NOT NULL DEFAULT 'TIME',
ADD COLUMN "maxRedemptions" INTEGER,
ADD COLUMN "redemptionsUsed" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "LimitedOffer_durationMode_idx" ON "LimitedOffer"("durationMode");
