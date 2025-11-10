-- CreateTable
CREATE TABLE "Obat" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "stok" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "kadaluarsa" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Obat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Opname" (
    "id" SERIAL NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "obatId" INTEGER NOT NULL,

    CONSTRAINT "Opname_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Opname" ADD CONSTRAINT "Opname_obatId_fkey" FOREIGN KEY ("obatId") REFERENCES "Obat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
