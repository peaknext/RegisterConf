import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert payment image path to use API route format
 * Handles backward compatibility for old /uploads/ paths
 */
export function getPaymentImageUrl(fileName: string | null): string | null {
  if (!fileName) return null;

  // If path already uses API route, return as-is
  if (fileName.startsWith("/api/uploads/")) return fileName;

  // Convert old format to new format
  if (fileName.startsWith("/uploads/")) {
    return fileName.replace("/uploads/", "/api/uploads/");
  }

  return fileName;
}
