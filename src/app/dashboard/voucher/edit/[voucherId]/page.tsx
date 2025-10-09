"use client";

import React, { use } from "react";
import EditVoucher from "../../components/edit-voucher";

interface EditVoucherPageProps {
  params: Promise<{ voucherId: string }>;
}

export default function EditVoucherPage({ params }: EditVoucherPageProps) {
  const { voucherId } = use(params);

  return <EditVoucher voucherId={voucherId} />;
}
