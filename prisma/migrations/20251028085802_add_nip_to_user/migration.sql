/*
  Warnings:

  - Added the required column `nip` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nip" TEXT NOT NULL;
