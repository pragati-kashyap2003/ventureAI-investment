import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function scoreColor(value: number): string {
  if (value >= 65) return "text-invest";
  if (value >= 40) return "text-amber";
  return "text-pass";
}

export function scoreBg(value: number): string {
  if (value >= 65) return "bg-invest";
  if (value >= 40) return "bg-amber";
  return "bg-pass";
}

export function scoreLabel(value: number): string {
  if (value >= 65) return "Strong";
  if (value >= 40) return "Moderate";
  return "Weak";
}
