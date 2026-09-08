import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-xl font-bold text-white">
        SB
      </div>
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">SmartBus</h1>
        <p className="mt-2 max-w-md text-slate-500">
          Manage trips, bookings, parcels and your fleet — all from one simple dashboard.
        </p>
      </div>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Create account
        </Link>
      </div>
    </main>
  );
}
