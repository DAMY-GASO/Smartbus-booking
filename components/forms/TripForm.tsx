"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { tripSchema, type TripInput } from "@/lib/validation";
import type { Bus } from "@/types";

interface TripFormProps {
  buses?: Bus[];
  defaultValues?: Partial<TripInput>;
  onSubmit: (values: TripInput) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function TripForm({ buses = [], defaultValues, onSubmit, isSubmitting, submitError }: TripFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof TripInput, string>>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    const result = tripSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof TripInput, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof TripInput;
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
        <label className="mb-1.5 block text-sm font-medium text-slate-700">Bus</label>
        <select
          name="busId"
          defaultValue={defaultValues?.busId ?? ""}
          className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        >
          <option value="" disabled>
            {buses.length ? "Select a bus" : "No buses yet — add one first"}
          </option>
          {buses.map((bus) => (
            <option key={bus.id} value={bus.id}>
              {bus.name} — {bus.plateNumber}
            </option>
          ))}
        </select>
        {errors.busId && <p className="mt-1 text-xs text-red-600">{errors.busId}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input label="Origin" name="origin" placeholder="Dar es Salaam" defaultValue={defaultValues?.origin} error={errors.origin} />
        <Input label="Destination" name="destination" placeholder="Arusha" defaultValue={defaultValues?.destination} error={errors.destination} />
      </div>

      <Input
        label="Departure time"
        type="datetime-local"
        name="departureAt"
        defaultValue={defaultValues?.departureAt}
        error={errors.departureAt}
      />

      <Input
        label="Fare (TZS)"
        type="number"
        name="fare"
        min={0}
        step="0.01"
        defaultValue={defaultValues?.fare}
        error={errors.fare}
      />

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Save trip
      </Button>
    </form>
  );
}
