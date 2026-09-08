"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TripForm } from "@/components/forms/TripForm";
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
import type { Bus, Trip } from "@/types";
import type { TripInput } from "@/lib/validation";

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [tripsRes, busesRes] = await Promise.all([fetch("/api/trips"), fetch("/api/buses")]);
    const tripsData = await tripsRes.json();
    const busesData = await busesRes.json();
    setTrips(tripsData.trips ?? []);
    setBuses(busesData.buses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(values: TripInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Unable to save trip.");
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
          <h1 className="text-xl font-semibold text-slate-900">Trips</h1>
          <p className="text-sm text-slate-500">Schedule and manage upcoming trips.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New trip
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Route</TableHeaderCell>
            <TableHeaderCell>Bus</TableHeaderCell>
            <TableHeaderCell>Departure</TableHeaderCell>
            <TableHeaderCell>Fare</TableHeaderCell>
            <TableHeaderCell>Seats left</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={6} message="Loading trips..." />
          ) : trips.length === 0 ? (
            <TableEmpty colSpan={6} message="No trips scheduled yet." />
          ) : (
            trips.map((trip) => (
              <TableRow key={trip.id}>
                <TableCell>
                  {trip.route?.origin} &rarr; {trip.route?.destination}
                </TableCell>
                <TableCell>{trip.bus?.name}</TableCell>
                <TableCell>{formatDateTime(trip.departureAt)}</TableCell>
                <TableCell>{formatCurrency(trip.fare)}</TableCell>
                <TableCell>{trip.seatsAvailable ?? "—"}</TableCell>
                <TableCell>
                  <Badge tone={statusTone(trip.status)}>{trip.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Schedule a new trip">
        <TripForm buses={buses} onSubmit={handleCreate} isSubmitting={isSubmitting} submitError={submitError} />
      </Modal>
    </div>
  );
}
