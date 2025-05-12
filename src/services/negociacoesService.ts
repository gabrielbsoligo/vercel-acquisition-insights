
import { fetchFilteredData } from './queryService';

/**
 * Fetches negociacoes data based on date range
 * @param dateRange The date range to filter by
 * @returns Filtered negociacoes data
 */
export const fetchNegociacoesData = async (
  dateRange: { from: Date, to: Date }
) => {
  try {
    const data = await fetchFilteredData('negociacoes', dateRange);
    return data || [];
  } catch (error) {
    console.error('Error fetching negociacoes data:', error);
    return [];
  }
};
