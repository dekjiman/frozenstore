"use client";

import { useParams } from "next/navigation";
import { AccountOrderDetail } from "@/components/account-order-detail";

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  return <AccountOrderDetail orderId={params.id} />;
}