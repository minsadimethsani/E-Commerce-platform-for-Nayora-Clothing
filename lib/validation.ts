import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string()
    .trim()
    .min(1, "First name is required"),
  lastName: z.string()
    .trim()
    .min(1, "Last name is required"),
  email: z.string()
    .email("Please enter a valid email address (e.g., name@example.com)"),
  phone: z.string()
    .regex(/^(?:07\d{8}|\+94\d{9})$/, "Please enter a valid phone number "),
  address: z.string()
    .trim()
    .min(1, "Shipping address is required"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
