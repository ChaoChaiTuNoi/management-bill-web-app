import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type StoreTransactionFilters = {
  startDate?: Date;
  endDate?: Date;
  transactionType?: TransactionType;
  categoryId?: string;
  search?: string;
  sortBy?: "billDate" | "totalPrice" | "productName";
  sortOrder?: "asc" | "desc";
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
    const {
      startDate,
      endDate,
      transactionType,
      categoryId,
      search,
      sortBy = "billDate",
      sortOrder = "desc",
      limit = 20,
      offset = 0
    } = filters;

    const where: Prisma.StoreTransactionWhereInput = {
      transactionType,
      billDate: {
        gte: startDate,
        lte: endDate
      },
      product: {
        categoryId
      }
    };

    if (search) {
      where.OR = [
        {
          product: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        },
        {
          product: {
            category: {
              name: {
                contains: search,
                mode: "insensitive"
              }
            }
          }
        }
      ];
    }

    const orderBy: Prisma.StoreTransactionOrderByWithRelationInput =
      sortBy === "productName"
        ? { product: { name: sortOrder } }
        : { [sortBy]: sortOrder };

    const [items, total] = await prisma.$transaction([
      prisma.storeTransaction.findMany({
        where,
        include: {
          product: {
            include: {
              category: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      }),
      prisma.storeTransaction.count({ where })
    ]);

    return { items, total, limit, offset };
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
