
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
  if (!dateString) return new Date();
  
  try {
    // Support for YYYY-MM-DD format (ISO)
    const isoParts = dateString.split('-');
    if (isoParts.length === 3) {
      return new Date(Number(isoParts[0]), Number(isoParts[1]) - 1, Number(isoParts[2]));
    }
    
    // Support for DD/MM/YYYY format (BR)
    const brParts = dateString.split('/');
    if (brParts.length === 3) {
      return new Date(Number(brParts[2]), Number(brParts[1]) - 1, Number(brParts[0]));
    }
    
    // Last resort - try standard JS Date parsing
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}`);
      return new Date(); // Return current date if format is invalid
    }
    return date;
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return new Date(); // Return current date if parsing fails
  }
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
