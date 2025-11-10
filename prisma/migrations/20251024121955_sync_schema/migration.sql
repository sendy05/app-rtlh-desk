/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Obat` table. All the data in the column will be lost.
  - You are about to drop the column `kadaluarsa` on the `Obat` table. All the data in the column will be lost.
  - The primary key for the `PasswordResetToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `PasswordResetToken` table. All the data in the column will be lost.
  - You are about to drop the `Opname` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Opname" DROP CONSTRAINT "Opname_obatId_fkey";

-- AlterTable
ALTER TABLE "Obat" DROP COLUMN "createdAt",
DROP COLUMN "kadaluarsa",
ADD COLUMN     "kategori" TEXT,
ADD COLUMN     "lokasiGudang" TEXT,
ADD COLUMN     "tanggalExp" TIMESTAMP(3),
ADD COLUMN     "tanggalMasuk" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "stok" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "PasswordResetToken" DROP CONSTRAINT "PasswordResetToken_pkey",
DROP COLUMN "createdAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "PasswordResetToken_id_seq";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."Opname";

-- CreateTable
CREATE TABLE "Distribusi" (
    "id" SERIAL NOT NULL,
    "obatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tujuan" TEXT NOT NULL,
    "keterangan" TEXT,

    CONSTRAINT "Distribusi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permintaan" (
    "id" SERIAL NOT NULL,
    "unitAsal" TEXT NOT NULL,
    "unitTujuan" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "Permintaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetailPermintaan" (
    "id" SERIAL NOT NULL,
    "permintaanId" INTEGER NOT NULL,
    "obatId" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,

    CONSTRAINT "DetailPermintaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laporan" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "jenis" TEXT NOT NULL,
    "keterangan" TEXT,
    "filePath" TEXT,

    CONSTRAINT "Laporan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Distribusi" ADD CONSTRAINT "Distribusi_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetailPermintaan" ADD CONSTRAINT "DetailPermintaan_permintaanId_fkey" FOREIGN KEY ("permintaanId") REFERENCES "Permintaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
