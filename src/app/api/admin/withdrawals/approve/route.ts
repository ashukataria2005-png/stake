import { NextRequest, NextResponse } from "next/server";
import { POST as approveTransactionPOST } from "@/app/api/admin/transactions/approve/route";

export async function POST(req: NextRequest) {
  return approveTransactionPOST(req);
}
