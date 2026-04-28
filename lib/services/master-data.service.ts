import { MasterDataRepository } from "@/lib/repositories/master-data.repository";

const repository = new MasterDataRepository();

export class MasterDataService {
  async createCategory(payload: { name: string }) {
    return repository.createCategory(payload);
  }

  async listCategories() {
    return repository.listCategories();
  }

  async createProduct(payload: { name: string; categoryId: string }) {
    return repository.createProduct(payload);
  }

  async listProducts(query: { categoryId?: string; limit?: number; offset?: number }) {
    return repository.listProducts(query);
  }

  async updateProduct(id: string, payload: { name: string; categoryId: string }) {
    return repository.updateProductById(id, payload);
  }

  async deleteProduct(id: string) {
    return repository.deleteProductById(id);
  }
}
