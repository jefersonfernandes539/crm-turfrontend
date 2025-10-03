import SellersList from "./components/sellers-list";

export default function Sellers() {
  return (
    <>
      <div className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Novo Voucher</h1>
              <p className="text-muted-foreground mt-2">
                Crie um novo voucher de reserva com todos os detalhes
                necessários.
              </p>
            </div>
          </div>
          <SellersList />
        </div>
      </div>
    </>
  );
}
