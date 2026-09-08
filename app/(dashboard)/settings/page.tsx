"use client";

import { FormEvent, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      // TODO: persist settings via an API route.
      await new Promise((resolve) => setTimeout(resolve, 600));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your company profile and preferences.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Company profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Company name" name="companyName" defaultValue="SmartBus" />
            <Input label="Support email" name="supportEmail" type="email" placeholder="support@example.com" />
            <Input label="Support phone" name="supportPhone" placeholder="+255 7XX XXX XXX" />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Save changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
