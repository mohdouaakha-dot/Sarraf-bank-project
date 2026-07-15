/*
  Warnings:

  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KycVerification" ADD COLUMN     "idDocumentStorageKey" TEXT,
ADD COLUMN     "selfieStorageKey" TEXT,
ALTER COLUMN "provider" DROP NOT NULL,
ALTER COLUMN "providerApplicantId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL;
