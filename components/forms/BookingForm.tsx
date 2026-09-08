"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { bookingSchema, type BookingInput } from "@/lib/validation";
import type { Trip } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface BookingFormProps {
  trips?: Trip[];
  defaultValues?: Partial<BookingInput>;
  onSubmit: (values: BookingInput) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function BookingForm({ trips = [], defaultValues, onSubmit, isSubmitting, submitError }: BookingFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof BookingInput, string>>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    const result = bookingSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BookingInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof BookingInput;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Trip</label>
        <select
          name="tripId"
          defaultValue={defaultValues?.tripId ?? ""}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="" disabled>
            Select a trip
          </option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.route?.origin ?? "?"} &rarr; {trip.route?.destination ?? "?"} ·{" "}
              {formatDateTime(trip.departureAt)} · {formatCurrency(trip.fare)}
            </option>
          ))}
        </select>
        {errors.tripId && <p className="mt-1 text-xs text-red-600">{errors.tripId}</p>}
      </div>

      <Input
        label="Passenger name"
        name="passengerName"
        defaultValue={defaultValues?.passengerName}
        error={errors.passengerName}
      />

      <Input
        label="Phone number"
        name="phone"
        defaultValue={defaultValues?.phone}
        error={errors.phone}
      />

      <Input
        label="Seat number"
        type="number"
        name="seatNumber"
        min={1}
        defaultValue={defaultValues?.seatNumber}
        error={errors.seatNumber}
      />

      <Input
        label="Amount paid (TZS)"
        type="number"
        name="amountPaid"
        min={0}
        step="0.01"
        defaultValue={defaultValues?.amountPaid ?? 0}
        error={errors.amountPaid}
      />

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Save booking
      </Button>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}
    </form>
  );
}
