import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const busSchema = z.object({
  name: z.string().min(2, "Bus name is required"),
  plateNumber: z.string().min(3, "Plate number is required"),
  capacity: z.coerce.number().int().positive("Capacity must be greater than 0"),
  make: z.string().optional(),
  model: z.string().optional(),
  active: z.coerce.boolean().optional().default(true),
});
export type BusInput = z.infer<typeof busSchema>;

export const tripSchema = z.object({
  busId: z.string().min(1, "Select a bus"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  departureAt: z.string().min(1, "Departure time is required"),
  fare: z.coerce.number().positive("Fare must be greater than 0"),
});
export type TripInput = z.infer<typeof tripSchema>;

export const bookingSchema = z.object({
  tripId: z.string().min(1, "Select a trip"),
  passengerName: z.string().min(2, "Passenger name is required"),
  phone: z.string().min(9, "Enter a valid phone number"),
  seatNumber: z.coerce.number().int().positive("Seat number is required"),
  amountPaid: z.coerce.number().min(0).default(0),
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const parcelSchema = z.object({
  tripId: z.string().min(1, "Select a trip"),
  senderName: z.string().min(2, "Sender name is required"),
  senderPhone: z.string().min(9, "Enter a valid phone number"),
  receiverName: z.string().min(2, "Receiver name is required"),
  receiverPhone: z.string().min(9, "Enter a valid phone number"),
  description: z.string().min(2, "Describe the parcel"),
  weightKg: z.coerce.number().positive().optional(),
  fee: z.coerce.number().positive("Fee must be greater than 0"),
});
export type ParcelInput = z.infer<typeof parcelSchema>;
