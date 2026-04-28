import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type TaxRecordFilters = {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
};

export class TaxRecordRepository {
  async create(data: { taxType: string; billName: string; amount: number; taxDate: Date }) {
    return prisma.taxRecord.create({
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount)
      }
    });
  }

  async findAll(filters: TaxRecordFilters) {
    const { startDate, endDate, limit = 20, offset = 0 } = filters;
    return prisma.taxRecord.findMany({
      where: {
        taxDate: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { taxDate: "desc" },
      take: limit,
      skip: offset
    });
  }

  async updateById(id: string, data: { taxType: string; billName: string; amount: number; taxDate: Date }) {
    return prisma.taxRecord.update({
      where: { id },
      data: {
        ...data,
        amount: new Prisma.Decimal(data.amount)
      }
    });
  }

  async deleteById(id: string) {
    return prisma.taxRecord.delete({ where: { id } });
  }

  async sumAmountByDateRange(startDate?: Date, endDate?: Date) {
    const result = await prisma.taxRecord.aggregate({
      _sum: { amount: true },
      where: {
        taxDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return Number(result._sum.amount ?? 0);
  }
}
