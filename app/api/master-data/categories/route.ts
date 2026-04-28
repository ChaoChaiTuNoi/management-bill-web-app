import { NextRequest, NextResponse } from "next/server";
import { MasterDataService } from "@/lib/services/master-data.service";
import { createCategorySchema } from "@/lib/validators/master-data.validator";
import { handleApiError } from "@/lib/utils/http";
import { toPlainJson } from "@/lib/utils/serialize";

const service = new MasterDataService();

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const payload = createCategorySchema.parse(json);
    const category = await service.createCategory(payload);
    return NextResponse.json(toPlainJson(category), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET() {
  try {
    const categories = await service.listCategories();
    return NextResponse.json(toPlainJson(categories));
  } catch (error) {
    return handleApiError(error);
  }
}
