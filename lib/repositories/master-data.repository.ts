import { prisma } from "@/lib/prisma";

export class MasterDataRepository {
  async findProductById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  }

  async createCategory(data: { name: string }) {
    return prisma.category.create({ data });
  }

  async listCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" }
    });
  }

  async createProduct(data: { name: string; categoryId: string }) {
    return prisma.product.create({
      data,
      include: { category: true }
    });
  }

  async updateProductById(id: string, data: { name: string; categoryId: string }) {
    return prisma.product.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  async deleteProductById(id: string) {
    return prisma.product.delete({ where: { id } });
  }

  async listProducts(params: { categoryId?: string; limit?: number; offset?: number }) {
    const { categoryId, limit = 50, offset = 0 } = params;
    return prisma.product.findMany({
      where: { categoryId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
  }
}
