"use client";

import React, { use } from "react";
import Pricebook from "../../components/pricebook";

interface PartnerDetailsPageProps {
  params: Promise<{ partnerId: string }>;
}

export default function PartnerDetailsPage({
  params,
}: PartnerDetailsPageProps) {
  const { partnerId } = use(params);

  return <Pricebook partnerId={partnerId} />;
}
