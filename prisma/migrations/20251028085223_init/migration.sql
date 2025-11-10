/*
  Warnings:

  - The values [ADMIN_DINKES,ADMIN_UNIT,USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `jabatan` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `nip` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `unitId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Distribusi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DistribusiItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Obat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Opname` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpnameItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Penerimaan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PenerimaanItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pengeluaran` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PengeluaranItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Stok` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Unit` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SURVEY', 'VERIFIER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'SURVEY';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Distribusi" DROP CONSTRAINT "Distribusi_unitAsalId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Distribusi" DROP CONSTRAINT "Distribusi_unitTujuanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DistribusiItem" DROP CONSTRAINT "DistribusiItem_distribusiId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DistribusiItem" DROP CONSTRAINT "DistribusiItem_obatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OpnameItem" DROP CONSTRAINT "OpnameItem_opnameId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Penerimaan" DROP CONSTRAINT "Penerimaan_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PenerimaanItem" DROP CONSTRAINT "PenerimaanItem_obatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PenerimaanItem" DROP CONSTRAINT "PenerimaanItem_penerimaanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Pengeluaran" DROP CONSTRAINT "Pengeluaran_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PengeluaranItem" DROP CONSTRAINT "PengeluaranItem_obatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PengeluaranItem" DROP CONSTRAINT "PengeluaranItem_pengeluaranId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stok" DROP CONSTRAINT "Stok_obatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Stok" DROP CONSTRAINT "Stok_unitId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_unitId_fkey";

-- DropIndex
DROP INDEX "public"."User_nip_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "jabatan",
DROP COLUMN "nama",
DROP COLUMN "nip",
DROP COLUMN "unitId",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'SURVEY';

-- DropTable
DROP TABLE "public"."Distribusi";

-- DropTable
DROP TABLE "public"."DistribusiItem";

-- DropTable
DROP TABLE "public"."Obat";

-- DropTable
DROP TABLE "public"."Opname";

-- DropTable
DROP TABLE "public"."OpnameItem";

-- DropTable
DROP TABLE "public"."Penerimaan";

-- DropTable
DROP TABLE "public"."PenerimaanItem";

-- DropTable
DROP TABLE "public"."Pengeluaran";

-- DropTable
DROP TABLE "public"."PengeluaranItem";

-- DropTable
DROP TABLE "public"."Stok";

-- DropTable
DROP TABLE "public"."Unit";

-- CreateTable
CREATE TABLE "Kecamatan" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Kecamatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Desa" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "kecamatanId" INTEGER NOT NULL,

    CONSTRAINT "Desa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" SERIAL NOT NULL,
    "kodeSurvey" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "desaId" INTEGER NOT NULL,
    "koordinatLat" DOUBLE PRECISION,
    "koordinatLng" DOUBLE PRECISION,
    "kondisiAtap" TEXT,
    "kondisiDinding" TEXT,
    "kondisiLantai" TEXT,
    "sanitasi" TEXT,
    "jumlahPenghuni" INTEGER,
    "prioritas" INTEGER NOT NULL DEFAULT 3,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "verifikatorId" INTEGER,
    "catatanVerif" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "surveyId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Survey_kodeSurvey_key" ON "Survey"("kodeSurvey");

-- AddForeignKey
ALTER TABLE "Desa" ADD CONSTRAINT "Desa_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "Kecamatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
