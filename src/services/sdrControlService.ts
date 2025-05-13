import { supabase } from "@/supabase";

// Define a type for the data structure
export type SDRControlEntry = {
  ID: number;
  Data: string;
  SDR: string;
  Show: number | null;
  NoShow: number | null;
  Reunião: number | null;
  Oportunidade: number | null;
  Proposta: number | null;
  Venda: number | null;
  MRR: number | null;
  "Data da Venda": string | null;
  Observações: string | null;
};

export const fetchEntries = async (): Promise<SDRControlEntry[]> => {
  try {
    const { data, error } = await supabase
      .from('Controle Pre Venda')
      .select('*')
      .order('Data', { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
      throw new Error(error.message);
    }

    return data as SDRControlEntry[];
  } catch (error) {
    console.error("Error fetching entries:", error);
    throw error;
  }
};

export const createEntry = async (data: Record<string, any>) => {
  try {
    // Initialize parsed values object
    const cleanedData: Record<string, any> = {};

    // Map form field names to database column names
    for (const [key, value] of Object.entries(data)) {
      let parsedValue: any = value;

      // Sanitize and convert numeric values
      if (key === 'Show' || key === 'NoShow' || key === 'Reunião' || key === 'Oportunidade' || key === 'Proposta' || key === 'Venda' || key === 'MRR') {
        parsedValue = value !== '' ? parseInt(value, 10) : null; // or 0, depending on your needs
      }

      // Assign the parsed value to the cleaned data object
      cleanedData[key] = parsedValue;
    }
    
    // Get the next ID from the table for auto-incrementing
    const { data: maxIdData } = await supabase
      .from('Controle Pre Venda')
      .select('ID')
      .order('ID', { ascending: false })
      .limit(1);
    
    // Calculate the next ID (or start with 1 if no rows exist)
    const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].ID + 1 : 1;
    
    // Add the ID field to the data being inserted
    // TypeScript needs this explicit type assertion to satisfy the "ID is required" constraint
    const finalData = {
      ...cleanedData,
      ID: nextId
    };
    
    const { error } = await supabase
      .from('Controle Pre Venda')
      .insert(finalData);

    if (error) {
      console.error('Error inserting data:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Error creating entry:', error);
    throw error;
  }
};

export const updateEntry = async (id: number, updates: Record<string, any>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Controle Pre Venda')
      .update(updates)
      .eq('ID', id);

    if (error) {
      console.error("Error updating data:", error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error("Error updating entry:", error);
    throw error;
  }
};

export const deleteEntry = async (id: number): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('Controle Pre Venda')
      .delete()
      .eq('ID', id);

    if (error) {
      console.error("Error deleting data:", error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error("Error deleting entry:", error);
    throw error;
  }
};
