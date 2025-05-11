
import { DateRange } from "react-day-picker";
import { parseDate, isDateInRange } from "../dataSourceService";

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
  
  return { from, to };
};
