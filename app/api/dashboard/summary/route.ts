import { NextRequest, NextResponse } from "next/server";
import { DashboardService } from "@/lib/services/dashboard.service";
import { dateRangeQuerySchema } from "@/lib/validators/common.validator";
import { handleApiError } from "@/lib/utils/http";

const service = new DashboardService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams.entries());
    const query = dateRangeQuerySchema.parse(searchParams);
    const summary = await service.getSummary(query);
    return NextResponse.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}
