/*
  Warnings:

  - You are about to drop the column `jumlah` on the `Distribusi` table. All the data in the column will be lost.
  - You are about to drop the column `obatId` on the `Distribusi` table. All the data in the column will be lost.
  - You are about to drop the column `tujuan` on the `Distribusi` table. All the data in the column will be lost.
  - The primary key for the `Obat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Obat` table. All the data in the column will be lost.
  - You are about to drop the column `lokasiGudang` on the `Obat` table. All the data in the column will be lost.
  - You are about to drop the column `stok` on the `Obat` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalExp` on the `Obat` table. All the data in the column will be lost.
  - You are about to drop the column `tanggalMasuk` on the `Obat` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `DetailPermintaan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Laporan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permintaan` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[noDistribusi]` on the table `Distribusi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[kode]` on the table `Obat` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nip]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `noDistribusi` to the `Distribusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitAsalId` to the `Distribusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitTujuanId` to the `Distribusi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kode` to the `Obat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Obat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jabatan` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nip` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN_DINKES', 'ADMIN_UNIT', 'USER');

-- DropForeignKey
ALTER TABLE "public"."DetailPermintaan" DROP CONSTRAINT "DetailPermintaan_permintaanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Distribusi" DROP CONSTRAINT "Distribusi_obatId_fkey";

-- AlterTable
ALTER TABLE "Distribusi" DROP COLUMN "jumlah",
DROP COLUMN "obatId",
DROP COLUMN "tujuan",
ADD COLUMN     "noDistribusi" TEXT NOT NULL,
ADD COLUMN     "unitAsalId" INTEGER NOT NULL,
ADD COLUMN     "unitTujuanId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Obat" DROP CONSTRAINT "Obat_pkey",
DROP COLUMN "id",
DROP COLUMN "lokasiGudang",
DROP COLUMN "stok",
DROP COLUMN "tanggalExp",
DROP COLUMN "tanggalMasuk",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "kode" TEXT NOT NULL,
ADD COLUMN     "obatId" SERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "Obat_pkey" PRIMARY KEY ("obatId");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "jabatan" TEXT NOT NULL,
ADD COLUMN     "nama" TEXT NOT NULL,
ADD COLUMN     "nip" TEXT NOT NULL,
ADD COLUMN     "unitId" INTEGER NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "public"."DetailPermintaan";

-- DropTable
DROP TABLE "public"."Laporan";

-- DropTable
DROP TABLE "public"."PasswordResetToken";

-- DropTable
DROP TABLE "public"."Permintaan";

-- CreateTable
CREATE TABLE "Unit" (
    "unitId" SERIAL NOT NULL,
    "nmunit" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "alamat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("unitId")
);

-- CreateTable
CREATE TABLE "Stok" (
    "id" SERIAL NOT NULL,
    "obatId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 0,
    "expiredAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opname" (
    "id" SERIAL NOT NULL,
    "unitId" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "keterangan" TEXT,

    CONSTRAINT "Opname_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpnameItem" (
    "id" SERIAL NOT NULL,
    "opnameId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,
    "stokSistem" INTEGER NOT NULL,
    "stokFisik" INTEGER NOT NULL,
    "selisih" INTEGER NOT NULL,

    CONSTRAINT "OpnameItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penerimaan" (
    "id" SERIAL NOT NULL,
    "noTransaksi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitId" INTEGER NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Penerimaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenerimaanItem" (
    "id" SERIAL NOT NULL,
    "penerimaanId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" DOUBLE PRECISION,

    CONSTRAINT "PenerimaanItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengeluaran" (
    "id" SERIAL NOT NULL,
    "noTransaksi" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unitId" INTEGER NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Pengeluaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengeluaranItem" (
    "id" SERIAL NOT NULL,
    "pengeluaranId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tujuan" TEXT,

    CONSTRAINT "PengeluaranItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistribusiItem" (
    "id" SERIAL NOT NULL,
    "distribusiId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "DistribusiItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Penerimaan_noTransaksi_key" ON "Penerimaan"("noTransaksi");

-- CreateIndex
CREATE UNIQUE INDEX "Pengeluaran_noTransaksi_key" ON "Pengeluaran"("noTransaksi");

-- CreateIndex
CREATE UNIQUE INDEX "Distribusi_noDistribusi_key" ON "Distribusi"("noDistribusi");

-- CreateIndex
CREATE UNIQUE INDEX "Obat_kode_key" ON "Obat"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "User_nip_key" ON "User"("nip");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("obatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpnameItem" ADD CONSTRAINT "OpnameItem_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "Opname"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penerimaan" ADD CONSTRAINT "Penerimaan_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenerimaanItem" ADD CONSTRAINT "PenerimaanItem_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("obatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenerimaanItem" ADD CONSTRAINT "PenerimaanItem_penerimaanId_fkey" FOREIGN KEY ("penerimaanId") REFERENCES "Penerimaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengeluaran" ADD CONSTRAINT "Pengeluaran_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengeluaranItem" ADD CONSTRAINT "PengeluaranItem_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("obatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengeluaranItem" ADD CONSTRAINT "PengeluaranItem_pengeluaranId_fkey" FOREIGN KEY ("pengeluaranId") REFERENCES "Pengeluaran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribusi" ADD CONSTRAINT "Distribusi_unitAsalId_fkey" FOREIGN KEY ("unitAsalId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Distribusi" ADD CONSTRAINT "Distribusi_unitTujuanId_fkey" FOREIGN KEY ("unitTujuanId") REFERENCES "Unit"("unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistribusiItem" ADD CONSTRAINT "DistribusiItem_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("obatId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DistribusiItem" ADD CONSTRAINT "DistribusiItem_distribusiId_fkey" FOREIGN KEY ("distribusiId") REFERENCES "Distribusi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
