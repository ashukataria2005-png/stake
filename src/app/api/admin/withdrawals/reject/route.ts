import { NextRequest, NextResponse } from "next/server";
import { POST as rejectTransactionPOST } from "@/app/api/admin/transactions/reject/route";

export async function POST(req: NextRequest) {
  return rejectTransactionPOST(req);
}
