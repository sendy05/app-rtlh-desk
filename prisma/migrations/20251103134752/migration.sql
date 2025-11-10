/*
  Warnings:

  - The primary key for the `Desa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Desa` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Desa` table. All the data in the column will be lost.
  - The primary key for the `Kecamatan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Kecamatan` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Kecamatan` table. All the data in the column will be lost.
  - Added the required column `namadesa` to the `Desa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `namakecamatan` to the `Kecamatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kecamatanId` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `noKK` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pemilik` to the `Survey` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Desa" DROP CONSTRAINT "Desa_kecamatanId_fkey";

-- AlterTable
ALTER TABLE "Desa" DROP CONSTRAINT "Desa_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "desaId" SERIAL NOT NULL,
ADD COLUMN     "namadesa" TEXT NOT NULL,
ADD CONSTRAINT "Desa_pkey" PRIMARY KEY ("desaId");

-- AlterTable
ALTER TABLE "Kecamatan" DROP CONSTRAINT "Kecamatan_pkey",
DROP COLUMN "id",
DROP COLUMN "name",
ADD COLUMN     "kecamatanId" SERIAL NOT NULL,
ADD COLUMN     "namakecamatan" TEXT NOT NULL,
ADD CONSTRAINT "Kecamatan_pkey" PRIMARY KEY ("kecamatanId");

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "kecamatanId" INTEGER NOT NULL,
ADD COLUMN     "luasBangunan" DOUBLE PRECISION,
ADD COLUMN     "noKK" TEXT NOT NULL,
ADD COLUMN     "pemilik" TEXT NOT NULL,
ADD COLUMN     "sumberAir" TEXT;

-- AddForeignKey
ALTER TABLE "Desa" ADD CONSTRAINT "Desa_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "Kecamatan"("kecamatanId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_desaId_fkey" FOREIGN KEY ("desaId") REFERENCES "Desa"("desaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_kecamatanId_fkey" FOREIGN KEY ("kecamatanId") REFERENCES "Kecamatan"("kecamatanId") ON DELETE RESTRICT ON UPDATE CASCADE;
