-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "ingredients" TEXT[] DEFAULT ARRAY[]::TEXT[];
