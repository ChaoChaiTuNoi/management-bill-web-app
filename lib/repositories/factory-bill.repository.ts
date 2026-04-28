import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type FactoryBillFilters = {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  limit?: number;
  offset?: number;
};

export class FactoryBillRepository {
  async create(data: {
    productId: string;
    pricePerUnit: number;
    totalPrice: number;
    weightKg: number;
    billDate: Date;
  }) {
    return prisma.factoryBill.create({
      data: {
        ...data,
        pricePerUnit: new Prisma.Decimal(data.pricePerUnit),
        totalPrice: new Prisma.Decimal(data.totalPrice),
        weightKg: new Prisma.Decimal(data.weightKg)
      },
      include: { product: true }
    });
  }

  async findAll(filters: FactoryBillFilters) {
    const { startDate, endDate, categoryId, limit = 20, offset = 0 } = filters;
    return prisma.factoryBill.findMany({
      where: {
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
      billDate: Date;
    }
  ) {
    return prisma.factoryBill.update({
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
    return prisma.factoryBill.delete({ where: { id } });
  }

  async sumTotalPriceByDateRange(startDate?: Date, endDate?: Date) {
    const result = await prisma.factoryBill.aggregate({
      _sum: { totalPrice: true },
      where: {
        billDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return Number(result._sum.totalPrice ?? 0);
  }
}
