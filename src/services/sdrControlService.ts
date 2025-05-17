
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

export type SdrControlFormData = {
  Data: string;
  SDR: string;
  "Empresas Ativadas": number;
  "Ligações Atendidas": number;
  "Ligações Realizadas": number;
  "Marcadas Inbound": number;
  "Marcadas Out": number;
  "Marcadas Recom": number;
  Noshow: number;
  "Novas Conexões Stakeholder": number;
  "Recomendações Coletadas": number;
  Remarcadas: number;
  "Show Inbound": number;
  "Show Out": number;
  "Show Recom": number;
  Tempo: number;
};

// Type for our database insert
type SdrControlDbData = SdrControlFormData & { ID: number };

export async function insertSdrControlData(formData: SdrControlFormData): Promise<boolean> {
  try {
    // Convert empty string inputs to null values
    const cleanedData = Object.entries(formData).reduce((acc, [key, value]) => {
      acc[key] = value === "" ? null : value;
      return acc;
    }, {} as Record<string, any>);
    
    // Convert time value to seconds if needed
    if (typeof cleanedData.Tempo === 'string') {
      const timeMatch = (cleanedData.Tempo as string).match(/^(\d+):(\d+):(\d+)$/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const seconds = parseInt(timeMatch[3]);
        cleanedData.Tempo = hours * 3600 + minutes * 60 + seconds;
      }
    }
    
    // First, get the next available ID
    const { data: maxIdResult, error: maxIdError } = await supabase
      .from('Controle Pre Venda')
      .select('ID')
      .order('ID', { ascending: false })
      .limit(1);
    
    if (maxIdError) {
      console.error("Error fetching max ID:", maxIdError);
      toast.error("Erro ao obter ID: " + maxIdError.message);
      return false;
    }
    
    // Calculate the next available ID
    const nextId = maxIdResult && maxIdResult.length > 0 ? maxIdResult[0].ID + 1 : 1;
    
    // Create a properly typed object with ID included
    const dataToInsert: SdrControlDbData = {
      ...cleanedData as SdrControlFormData,
      ID: nextId
    };
    
    // Now insert with the ID field included
    const { error } = await supabase
      .from('Controle Pre Venda')
      .insert(dataToInsert);
    
    if (error) {
      console.error("Error inserting data:", error);
      toast.error("Erro ao salvar dados: " + error.message);
      return false;
    }
    
    toast.success("Dados salvos com sucesso!");
    return true;
  } catch (error: any) {
    console.error("Error in insertSdrControlData:", error);
    toast.error("Erro ao processar dados: " + error.message);
    return false;
  }
}

// Function to fetch SDR names for dropdown
export async function fetchSdrNames(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('Controle Pre Venda')
      .select('SDR')
      .not('SDR', 'is', null);
    
    if (error) {
      console.error("Error fetching SDR names:", error);
      return [];
    }
    
    // Extract unique SDR names
    const sdrNames = new Set<string>();
    data?.forEach(row => {
      if (row.SDR) sdrNames.add(row.SDR);
    });
    
    return Array.from(sdrNames);
  } catch (error) {
    console.error("Error in fetchSdrNames:", error);
    return [];
  }
}
