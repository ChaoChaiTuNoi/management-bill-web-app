import { TaxRecordRepository } from "@/lib/repositories/tax-record.repository";
import { CreateTaxRecordInput, UpdateTaxRecordInput } from "@/lib/validators/tax-record.validator";

const taxRecordRepository = new TaxRecordRepository();

export class TaxRecordService {
  async createTaxRecord(payload: CreateTaxRecordInput) {
    return taxRecordRepository.create(payload);
  }

  async listTaxRecords(query: {
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    return taxRecordRepository.findAll(query);
  }

  async updateTaxRecord(id: string, payload: UpdateTaxRecordInput) {
    return taxRecordRepository.updateById(id, payload);
  }

  async deleteTaxRecord(id: string) {
    return taxRecordRepository.deleteById(id);
  }
}
