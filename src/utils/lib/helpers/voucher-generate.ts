export function generateVoucherCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const random = Math.floor(1000 + Math.random() * 9000);

  return `BTJR${year}${month}${day}${random}`;
}
