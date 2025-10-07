"use client";

import { useDebounce } from "@/hooks/useDebounce";
import { useState } from "react";
import { ReservationsHeader } from "./components/reservations-header";
import { ReservationsSearch } from "./components/reservations-search";
import { ReservationsTable } from "./components/reservations-table";
import { ReservationDetailsDialog } from "./components/reservation-details-dialog";
import { useReservations } from "@/hooks/use-reservations";

export default function ReservePage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedReservationId, setSelectedReservationId] = useState<
    string | null
  >(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const { reservations, loading, deleteReservation } =
    useReservations(debouncedSearchTerm);

  const handleRowClick = (id: string) => {
    setSelectedReservationId(id);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedReservationId(null);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <ReservationsHeader />
      <ReservationsSearch value={searchTerm} onChange={setSearchTerm} />
      <ReservationsTable
        reservations={reservations}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {selectedReservationId && (
        <ReservationDetailsDialog
          reservationId={selectedReservationId}
          open={isDetailsOpen}
          onOpenChange={handleCloseDetails}
          onDelete={deleteReservation}
        />
      )}
    </div>
  );
}
