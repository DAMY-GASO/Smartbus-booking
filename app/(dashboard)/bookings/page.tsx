"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { BookingForm } from "@/components/forms/BookingForm";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import type { Booking, Trip } from "@/types";
import type { BookingInput } from "@/lib/validation";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [bookingsRes, tripsRes] = await Promise.all([fetch("/api/bookings"), fetch("/api/trips")]);
    const bookingsData = await bookingsRes.json();
    const tripsData = await tripsRes.json();
    setBookings(bookingsData.bookings ?? []);
    setTrips((tripsData.trips ?? []).filter((t: Trip) => t.status !== "CANCELLED" && t.status !== "COMPLETED"));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(values: BookingInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Unable to save booking.");
        return;
      }
      setModalOpen(false);
      await loadData();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
          <p className="text-sm text-slate-500">Passenger tickets for upcoming and past trips.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New booking
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Passenger</TableHeaderCell>
            <TableHeaderCell>Route</TableHeaderCell>
            <TableHeaderCell>Seat</TableHeaderCell>
            <TableHeaderCell>Amount</TableHeaderCell>
            <TableHeaderCell>Booked on</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={6} message="Loading bookings..." />
          ) : bookings.length === 0 ? (
            <TableEmpty colSpan={6} message="No bookings yet." />
          ) : (
            bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.passengerName}
                  <div className="text-xs text-slate-400">{booking.phone}</div>
                </TableCell>
                <TableCell>
                  {booking.trip?.route?.origin} &rarr; {booking.trip?.route?.destination}
                </TableCell>
                <TableCell>{booking.seatNumber}</TableCell>
                <TableCell>{formatCurrency(booking.amountPaid)}</TableCell>
                <TableCell>{formatDateTime(booking.createdAt)}</TableCell>
                <TableCell>
                  <Badge tone={statusTone(booking.status)}>{booking.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New booking">
        <BookingForm trips={trips} onSubmit={handleCreate} isSubmitting={isSubmitting} submitError={submitError} />
      </Modal>
    </div>
  );
}
