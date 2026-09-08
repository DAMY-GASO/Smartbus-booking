"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ParcelForm } from "@/components/forms/ParcelForm";
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
import type { Parcel, Trip } from "@/types";
import type { ParcelInput } from "@/lib/validation";

export default function ParcelsPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    const [parcelsRes, tripsRes] = await Promise.all([fetch("/api/parcels"), fetch("/api/trips")]);
    const parcelsData = await parcelsRes.json();
    const tripsData = await tripsRes.json();
    setParcels(parcelsData.parcels ?? []);
    setTrips((tripsData.trips ?? []).filter((t: Trip) => t.status !== "CANCELLED"));
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(values: ParcelInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/parcels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Unable to save parcel.");
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
          <h1 className="text-xl font-semibold text-slate-900">Parcels</h1>
          <p className="text-sm text-slate-500">Track parcel deliveries between destinations.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          New parcel
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Sender</TableHeaderCell>
            <TableHeaderCell>Receiver</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Fee</TableHeaderCell>
            <TableHeaderCell>Sent on</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={6} message="Loading parcels..." />
          ) : parcels.length === 0 ? (
            <TableEmpty colSpan={6} message="No parcels recorded yet." />
          ) : (
            parcels.map((parcel) => (
              <TableRow key={parcel.id}>
                <TableCell>
                  {parcel.senderName}
                  <div className="text-xs text-slate-400">{parcel.senderPhone}</div>
                </TableCell>
                <TableCell>
                  {parcel.receiverName}
                  <div className="text-xs text-slate-400">{parcel.receiverPhone}</div>
                </TableCell>
                <TableCell>{parcel.description}</TableCell>
                <TableCell>{formatCurrency(parcel.fee)}</TableCell>
                <TableCell>{formatDateTime(parcel.createdAt)}</TableCell>
                <TableCell>
                  <Badge tone={statusTone(parcel.status)}>{parcel.status}</Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New parcel">
        <ParcelForm trips={trips} onSubmit={handleCreate} isSubmitting={isSubmitting} submitError={submitError} />
      </Modal>
    </div>
  );
}
