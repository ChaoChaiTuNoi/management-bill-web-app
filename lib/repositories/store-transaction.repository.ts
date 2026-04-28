import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type StoreTransactionFilters = {
  startDate?: Date;
  endDate?: Date;
  transactionType?: TransactionType;
  categoryId?: string;
  limit?: number;
  offset?: number;
};

export class StoreTransactionRepository {
  async create(data: {
    productId: string;
    pricePerUnit: number;
    totalPrice: number;
    weightKg: number;
    transactionType: TransactionType;
    billDate: Date;
  }) {
    return prisma.storeTransaction.create({
      data: {
        ...data,
        pricePerUnit: new Prisma.Decimal(data.pricePerUnit),
        totalPrice: new Prisma.Decimal(data.totalPrice),
        weightKg: new Prisma.Decimal(data.weightKg)
      },
      include: { product: true }
    });
  }

  async findAll(filters: StoreTransactionFilters) {
    const { startDate, endDate, transactionType, categoryId, limit = 20, offset = 0 } = filters;
    return prisma.storeTransaction.findMany({
      where: {
        transactionType,
        billDate: {
          gte: startDate,
          lte: endDate
        },
        product: {
          categoryId
        }
      },
      include: {
        product: {
          include: {
            category: true
          }
        }
      },
      orderBy: { billDate: "desc" },
      take: limit,
      skip: offset
    });
  }

  async updateById(
    id: string,
    data: {
      productId: string;
      pricePerUnit: number;
      totalPrice: number;
      weightKg: number;
      transactionType: TransactionType;
      billDate: Date;
    }
  ) {
    return prisma.storeTransaction.update({
      where: { id },
      data: {
        ...data,
        pricePerUnit: new Prisma.Decimal(data.pricePerUnit),
        totalPrice: new Prisma.Decimal(data.totalPrice),
        weightKg: new Prisma.Decimal(data.weightKg)
      },
      include: { product: true }
    });
  }

  async deleteById(id: string) {
    return prisma.storeTransaction.delete({ where: { id } });
  }

  async sumByType(startDate: Date | undefined, endDate: Date | undefined, type: TransactionType) {
    const result = await prisma.storeTransaction.aggregate({
      _sum: { totalPrice: true },
      where: {
        transactionType: type,
        billDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return Number(result._sum.totalPrice ?? 0);
  }
}
