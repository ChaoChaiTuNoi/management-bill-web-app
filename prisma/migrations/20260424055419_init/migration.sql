-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FactoryBill" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "pricePerUnit" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "weightKg" DECIMAL(12,3) NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FactoryBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreTransaction" (
    "id" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "pricePerUnit" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "weightKg" DECIMAL(12,3) NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRecord" (
    "id" UUID NOT NULL,
    "taxType" TEXT NOT NULL,
    "billName" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "taxDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaxRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_categoryId_key" ON "Product"("name", "categoryId");

-- CreateIndex
CREATE INDEX "FactoryBill_productId_billDate_idx" ON "FactoryBill"("productId", "billDate");

-- CreateIndex
CREATE INDEX "StoreTransaction_productId_billDate_idx" ON "StoreTransaction"("productId", "billDate");

-- CreateIndex
CREATE INDEX "StoreTransaction_transactionType_billDate_idx" ON "StoreTransaction"("transactionType", "billDate");

-- CreateIndex
CREATE INDEX "TaxRecord_taxDate_idx" ON "TaxRecord"("taxDate");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FactoryBill" ADD CONSTRAINT "FactoryBill_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreTransaction" ADD CONSTRAINT "StoreTransaction_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
