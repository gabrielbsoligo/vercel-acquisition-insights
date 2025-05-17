
import { DateRange } from "react-day-picker";

// Helper function to ensure DateRange has proper values
export const normalizeDateRange = (dateRange?: DateRange): { from: Date; to: Date } => {
  // If no dateRange provided, use default range
  if (!dateRange) {
    const today = new Date();
    return { 
      from: new Date(today.getFullYear(), today.getMonth(), 1), 
      to: today 
    };
  }
  
  // If 'from' is missing, use the first day of the current month
  const from = dateRange.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  
  // If 'to' is missing, use the current date
  const to = dateRange.to || new Date();
  
  // Handle case where from is after to
  if (from > to) {
    return { from: to, to: from };
  }
  
  return { from, to };
};

/**
 * Parses a date string in either DD/MM/YYYY or YYYY-MM-DD format
 * @param dateString The date string to parse
 * @returns A Date object
 */
export const parseDate = (dateString: string): Date => {
  // Support for both DD/MM/YYYY and YYYY-MM-DD formats
  const parts = dateString.split(/[\/\-]/);
  
  if (parts.length !== 3) {
    console.warn(`Invalid date format: ${dateString}`);
    return new Date(); // Return current date if format is invalid
  }
  
  // Check if first part is a year (YYYY-MM-DD format)
  if (parts[0].length === 4) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  
  // Otherwise assume DD/MM/YYYY format
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

/**
 * Checks if a date is within a date range
 * @param date The date to check
 * @param from The start of the range
 * @param to The end of the range
 * @returns boolean indicating if the date is in range
 */
export const isDateInRange = (date: Date, from: Date, to: Date): boolean => {
  return date >= from && date <= to;
};

/**
 * Format date to ISO string for Supabase query (YYYY-MM-DD)
 * @param date The date to format
 * @returns ISO date string
 */
export const formatDateForQuery = (date: Date): string => {
  // Ensure we're working with a valid date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.error("Invalid date provided to formatDateForQuery:", date);
    return new Date().toISOString().split('T')[0];
  }
  
  // Format to YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
