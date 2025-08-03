import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format number with commas for display
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN')
}

// Format currency with Indian Rupee symbol and commas (no decimals)
export function formatCurrency(num: number): string {
  return `₹${Math.round(num).toLocaleString('en-IN')}`
}

// Parse comma-separated input to number
export function parseCommaNumber(value: string): number {
  const cleaned = value.replace(/,/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Format input value with commas as user types
export function formatInputValue(value: string): string {
  const cleaned = value.replace(/,/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? value : num.toLocaleString('en-IN')
}
