"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, statusTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { BusForm } from "@/components/forms/BusForm";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
  TableEmpty,
} from "@/components/ui/Table";
import type { Bus } from "@/types";
import type { BusInput } from "@/lib/validation";

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function loadBuses() {
    setLoading(true);
    const res = await fetch("/api/buses");
    const data = await res.json();
    setBuses(data.buses ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBuses();
  }, []);

  async function handleCreate(values: BusInput) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Unable to save bus.");
        return;
      }
      setModalOpen(false);
      await loadBuses();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Buses</h1>
          <p className="text-sm text-slate-500">Manage your fleet of buses.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add bus
        </Button>
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Plate number</TableHeaderCell>
            <TableHeaderCell>Make / Model</TableHeaderCell>
            <TableHeaderCell>Capacity</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableEmpty colSpan={5} message="Loading buses..." />
          ) : buses.length === 0 ? (
            <TableEmpty colSpan={5} message="No buses added yet." />
          ) : (
            buses.map((bus) => (
              <TableRow key={bus.id}>
                <TableCell>{bus.name}</TableCell>
                <TableCell>{bus.plateNumber}</TableCell>
                <TableCell>
                  {bus.make ?? "—"} {bus.model ?? ""}
                </TableCell>
                <TableCell>{bus.capacity} seats</TableCell>
                <TableCell>
                  <Badge tone={statusTone(bus.active ? "ACTIVE" : "INACTIVE")}>
                    {bus.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add bus">
        <BusForm onSubmit={handleCreate} isSubmitting={isSubmitting} submitError={submitError} />
      </Modal>
    </div>
  );
}
