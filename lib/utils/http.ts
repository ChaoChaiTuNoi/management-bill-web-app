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

  if (error instanceof Error) {
    // Log runtime details so Vercel function logs show the real root cause.
    console.error("[API_ERROR]", error);

    const message = error.message.toLowerCase();
    if (message.includes("p1001") || message.includes("can't reach database server")) {
      return NextResponse.json(
        { message: "Database connection failed. Please verify DATABASE_URL." },
        { status: 503 }
      );
    }

    if (message.includes("does not exist")) {
      return NextResponse.json(
        { message: "Database schema is missing. Run prisma migrations first." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
