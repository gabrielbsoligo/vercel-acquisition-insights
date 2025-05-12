
import { fetchFilteredData } from './queryService';

/**
 * Fetches meta data for SDRs
 * @returns SDR meta data
 */
export const fetchSdrMetaData = async () => {
  try {
    // Fetch from Meta Pre Venda table with a wide date range to get all data
    const data = await fetchFilteredData(
      'sdr_meta',
      { from: new Date(2020, 0, 1), to: new Date(2030, 11, 31) }
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching SDR meta data:', error);
    return [];
  }
};

/**
 * Fetches meta data for closers
 * @returns Closer meta data
 */
export const fetchCloserMetaData = async () => {
  try {
    // Fetch from Meta Closer table with a wide date range to get all data
    const data = await fetchFilteredData(
      'closer_meta',
      { from: new Date(2020, 0, 1), to: new Date(2030, 11, 31) }
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching closer meta data:', error);
    return [];
  }
};

/**
 * Fetches meta data for the company
 * @returns Company meta data
 */
export const fetchEmpresaMetaData = async () => {
  try {
    // Fetch from Meta Empresa table with a wide date range to get all data
    const data = await fetchFilteredData(
      'empresa_meta',
      { from: new Date(2020, 0, 1), to: new Date(2030, 11, 31) }
    );
    return data || [];
  } catch (error) {
    console.error('Error fetching empresa meta data:', error);
    return [];
  }
};
