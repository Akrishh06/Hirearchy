import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export type ApiErrorShape = {
  code: string;
  message: string;
};

export function ok<T>(data: T, traceId?: string) {
  return NextResponse.json({
    success: true,
    data,
    error: null,
    traceId: traceId ?? randomUUID(),
  });
}

export function fail(error: ApiErrorShape, status = 400, traceId?: string) {
  return NextResponse.json(
    {
      success: false,
      data: null,
      error,
      traceId: traceId ?? randomUUID(),
    },
    { status },
  );
}
