import { NextRequest, NextResponse } from "next/server";
import { FactoryBillService } from "@/lib/services/factory-bill.service";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";
import {
  createFactoryBillSchema,
  listFactoryBillQuerySchema
} from "@/lib/validators/factory-bill.validator";

const service = new FactoryBillService();

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = createFactoryBillSchema.parse(json);
    const created = await service.createFactoryBill(payload);

    return NextResponse.json(toPlainJson(created), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listFactoryBillQuerySchema.parse(searchParams);
    const items = await service.listFactoryBills(query);

    return NextResponse.json(toPlainJson(items));
  } catch (error) {
    return handleApiError(error);
  }
}
