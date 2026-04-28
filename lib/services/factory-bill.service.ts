import { AppError } from "@/lib/utils/http";
import { FactoryBillRepository } from "@/lib/repositories/factory-bill.repository";
import { MasterDataRepository } from "@/lib/repositories/master-data.repository";
import {
  CreateFactoryBillInput,
  ListFactoryBillQueryInput,
  UpdateFactoryBillInput
} from "@/lib/validators/factory-bill.validator";

const factoryBillRepository = new FactoryBillRepository();
const masterDataRepository = new MasterDataRepository();

export class FactoryBillService {
  async createFactoryBill(payload: CreateFactoryBillInput) {
    const targetProduct = await masterDataRepository.findProductById(payload.productId);
    if (!targetProduct) {
      throw new AppError("Product not found", 404);
    }

    return factoryBillRepository.create(payload);
  }

  async listFactoryBills(query: ListFactoryBillQueryInput) {
    return factoryBillRepository.findAll(query);
  }

  async updateFactoryBill(id: string, payload: UpdateFactoryBillInput) {
    const targetProduct = await masterDataRepository.findProductById(payload.productId);
    if (!targetProduct) {
      throw new AppError("Product not found", 404);
    }
    return factoryBillRepository.updateById(id, payload);
  }

  async deleteFactoryBill(id: string) {
    return factoryBillRepository.deleteById(id);
  }
}
