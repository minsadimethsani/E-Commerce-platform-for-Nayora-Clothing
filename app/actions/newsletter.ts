"use server";

import { addSubscriber } from "@/lib/newsletter-db";
import { sendWelcomeEmail } from "@/lib/email";

export type ActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function subscribeToNewsletterAction(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;

  if (!email || !email.trim()) {
    return { error: "Please enter your email address." };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  // 1. Add subscriber to Firestore
  const result = await addSubscriber(cleanEmail);
  if (!result.success) {
    return { error: result.error || "Failed to subscribe. Please try again." };
  }

  // 2. Trigger welcome confirmation email (async)
  // We trigger it but don't block the action resolution in case it is slow or Resend is not configured
  sendWelcomeEmail(cleanEmail).catch((err) => {
    console.error("Error in welcome email background execution:", err);
  });

  return {
    success: true,
    message: "Thank you for subscribing to our newsletter! We've sent a confirmation email."
  };
}
