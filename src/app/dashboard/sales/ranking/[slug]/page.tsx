"use client";

import React, { use } from "react";
import SellerProfile from "../form-profile";

interface SellerPageProps {
  params: Promise<{ slug: string }>;
}

export default function SellerPage({ params }: SellerPageProps) {
  const { slug } = use(params);

  return <SellerProfile slug={slug} />;
}
