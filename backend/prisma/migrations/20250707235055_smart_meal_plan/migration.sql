/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the column `weekStartDate` on the `MealPlan` table. All the data in the column will be lost.
  - You are about to drop the `FridgeItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `weekStart` to the `MealPlan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FridgeItem" DROP CONSTRAINT "FridgeItem_userId_fkey";

-- AlterTable
ALTER TABLE "MealPlan" DROP COLUMN "updatedAt",
DROP COLUMN "weekStartDate",
ADD COLUMN     "weekStart" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "FridgeItem";
