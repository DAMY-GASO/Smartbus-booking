"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { parcelSchema, type ParcelInput } from "@/lib/validation";
import type { Trip } from "@/types";
import { formatDateTime } from "@/lib/utils";

interface ParcelFormProps {
  trips?: Trip[];
  defaultValues?: Partial<ParcelInput>;
  onSubmit: (values: ParcelInput) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function ParcelForm({ trips = [], defaultValues, onSubmit, isSubmitting, submitError }: ParcelFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof ParcelInput, string>>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    const result = parcelSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ParcelInput, string>> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as keyof ParcelInput] = issue.message;
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
            {trips.length ? "Select a trip" : "No trips yet — add one first"}
          </option>
          {trips.map((trip) => (
            <option key={trip.id} value={trip.id}>
              {trip.route?.origin} &rarr; {trip.route?.destination} · {formatDateTime(trip.departureAt)}
            </option>
          ))}
        </select>
        {errors.tripId && <p className="mt-1 text-xs text-red-600">{errors.tripId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Sender name" name="senderName" defaultValue={defaultValues?.senderName} error={errors.senderName} />
        <Input label="Sender phone" name="senderPhone" defaultValue={defaultValues?.senderPhone} error={errors.senderPhone} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Receiver name" name="receiverName" defaultValue={defaultValues?.receiverName} error={errors.receiverName} />
        <Input label="Receiver phone" name="receiverPhone" defaultValue={defaultValues?.receiverPhone} error={errors.receiverPhone} />
      </div>

      <Input label="Description" name="description" placeholder="1 box, documents" defaultValue={defaultValues?.description} error={errors.description} />

      <div className="grid grid-cols-2 gap-3">
        <Input label="Weight (kg, optional)" type="number" name="weightKg" min={0} step="0.1" defaultValue={defaultValues?.weightKg} />
        <Input label="Fee (TZS)" type="number" name="fee" min={0} step="0.01" defaultValue={defaultValues?.fee} error={errors.fee} />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Save parcel
      </Button>
    </form>
  );
}
