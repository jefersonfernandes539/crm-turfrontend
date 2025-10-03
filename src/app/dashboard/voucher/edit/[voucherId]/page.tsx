import EditVoucher from ".";

export default async function EditVoucherPage({
  params,
}: {
  params: { voucherId: string };
}) {
  const { voucherId } = params;
  return <EditVoucher voucherId={voucherId} />;
}
