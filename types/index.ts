export type Role = "ADMIN" | "MANAGER" | "AGENT";

export type TripStatus = "SCHEDULED" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "REFUNDED";

export type ParcelStatus = "RECEIVED" | "IN_TRANSIT" | "DELIVERED" | "RETURNED";

export interface Bus {
  id: string;
  plateNumber: string;
  name: string;
  capacity: number;
  make?: string | null;
  model?: string | null;
  active: boolean;
}

export interface RouteInfo {
  id: string;
  origin: string;
  destination: string;
  distanceKm?: number | null;
  estimatedTime?: number | null;
}

export interface Trip {
  id: string;
  busId: string;
  routeId: string;
  departureAt: string;
  arrivalAt?: string | null;
  fare: number;
  status: TripStatus;
  bus?: Bus;
  route?: RouteInfo;
  /** Derived by the API (bus capacity minus active bookings) — not stored in the DB. */
  seatsAvailable?: number;
}

export interface Booking {
  id: string;
  tripId: string;
  agentId: string;
  passengerName: string;
  phone: string;
  seatNumber: number;
  status: BookingStatus;
  amountPaid: number;
  createdAt: string;
}

export interface Parcel {
  id: string;
  tripId: string;
  agentId: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  description: string;
  weightKg?: number | null;
  fee: number;
  status: ParcelStatus;
  createdAt: string;
}

export interface StatCardData {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
}
