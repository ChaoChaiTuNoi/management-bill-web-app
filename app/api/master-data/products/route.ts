import { NextRequest, NextResponse } from "next/server";
import { MasterDataService } from "@/lib/services/master-data.service";
import { createProductSchema, listProductQuerySchema } from "@/lib/validators/master-data.validator";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";

const service = new MasterDataService();

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = createProductSchema.parse(json);
    const product = await service.createProduct(payload);
    return NextResponse.json(toPlainJson(product), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = listProductQuerySchema.parse(searchParams);
    const products = await service.listProducts(query);
    return NextResponse.json(toPlainJson(products));
  } catch (error) {
    return handleApiError(error);
  }
}
