import { VoucherFromReservation } from "../form";

interface VoucherPageProps {
  params: Promise<{ id: string }>;
}

export default async function VoucherPage({ params }: VoucherPageProps) {
  const { id } = await params;
  return <VoucherFromReservation reservationId={id} />;
}
