-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "MenuCategory" AS ENUM (
  'SIGNATURE',
  'COLD_BREW',
  'DESSERT',
  'ESPRESSO',
  'FILTER',
  'NON_COFFEE',
  'BAKERY',
  'SAVORY',
  'BREAKFAST'
);

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('JPY');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CARD_ON_DELIVERY', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'COMPLETED',
  'CANCELLED'
);

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priceMinor" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'JPY',
    "category" "MenuCategory" NOT NULL,
    "cardColor" TEXT,
    "titleColor" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isMostPopular" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMode" "PaymentMode" NOT NULL,
    "subtotalMinor" INTEGER NOT NULL,
    "discountMinor" INTEGER NOT NULL DEFAULT 0,
    "totalMinor" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'JPY',
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "streetAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "addressNotes" TEXT,
    "guestId" TEXT,
    "limitedOfferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT,
    "menuItemSlug" TEXT NOT NULL,
    "menuItemTitle" TEXT NOT NULL,
    "unitPriceMinor" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lineTotalMinor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stats" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "dailyCups" INTEGER NOT NULL DEFAULT 0,
    "vinylSpins" INTEGER NOT NULL DEFAULT 0,
    "arcade" INTEGER NOT NULL DEFAULT 0,
    "comboRate" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitedOffer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "availabilityStart" TIMESTAMP(3) NOT NULL,
    "availabilityEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LimitedOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitedOfferItem" (
    "id" TEXT NOT NULL,
    "limitedOfferId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LimitedOfferItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_slug_key" ON "MenuItem"("slug");

-- CreateIndex
CREATE INDEX "MenuItem_category_isActive_idx" ON "MenuItem"("category", "isActive");

-- CreateIndex
CREATE INDEX "MenuItem_isFeatured_idx" ON "MenuItem"("isFeatured");

-- CreateIndex
CREATE INDEX "MenuItem_isMostPopular_idx" ON "MenuItem"("isMostPopular");

-- CreateIndex
CREATE INDEX "MenuItem_isActive_idx" ON "MenuItem"("isActive");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Order_guestId_createdAt_idx" ON "Order"("guestId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_menuItemId_idx" ON "OrderItem"("menuItemId");

-- CreateIndex
CREATE INDEX "LimitedOffer_isActive_idx" ON "LimitedOffer"("isActive");

-- CreateIndex
CREATE INDEX "LimitedOffer_availabilityStart_availabilityEnd_idx" ON "LimitedOffer"(
  "availabilityStart",
  "availabilityEnd"
);

-- CreateIndex
CREATE INDEX "LimitedOfferItem_menuItemId_idx" ON "LimitedOfferItem"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "LimitedOfferItem_limitedOfferId_menuItemId_key" ON "LimitedOfferItem"(
  "limitedOfferId",
  "menuItemId"
);

-- AddForeignKey
ALTER TABLE "Order"
ADD CONSTRAINT "Order_limitedOfferId_fkey" FOREIGN KEY ("limitedOfferId") REFERENCES "LimitedOffer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem"
ADD CONSTRAINT "OrderItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedOfferItem"
ADD CONSTRAINT "LimitedOfferItem_limitedOfferId_fkey" FOREIGN KEY ("limitedOfferId") REFERENCES "LimitedOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitedOfferItem"
ADD CONSTRAINT "LimitedOfferItem_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
