"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { busSchema, type BusInput } from "@/lib/validation";

interface BusFormProps {
  defaultValues?: Partial<BusInput>;
  onSubmit: (values: BusInput) => Promise<void> | void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export function BusForm({ defaultValues, onSubmit, isSubmitting, submitError }: BusFormProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof BusInput, string>>>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = Object.fromEntries(formData.entries());

    const result = busSchema.safeParse(raw);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BusInput, string>> = {};
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as keyof BusInput] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    await onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input label="Bus name" name="name" placeholder="Kilimanjaro Express" defaultValue={defaultValues?.name} error={errors.name} />
      <Input label="Plate number" name="plateNumber" placeholder="T 123 ABC" defaultValue={defaultValues?.plateNumber} error={errors.plateNumber} />
      <Input label="Capacity" type="number" name="capacity" min={1} defaultValue={defaultValues?.capacity} error={errors.capacity} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Make (optional)" name="make" placeholder="Scania" defaultValue={defaultValues?.make} />
        <Input label="Model (optional)" name="model" placeholder="K410" defaultValue={defaultValues?.model} />
      </div>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Save bus
      </Button>
    </form>
  );
}
