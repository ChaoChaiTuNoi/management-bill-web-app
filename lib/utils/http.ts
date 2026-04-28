import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Validation failed", issues: error.flatten() },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json({ message: error.message }, { status: error.statusCode });
  }

  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
