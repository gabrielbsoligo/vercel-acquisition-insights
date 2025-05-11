export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      "Controle Closer": {
        Row: {
          Closer: string | null
          Data: string | null
          ID: number
          "Indicação Coletadas": string | null
          "No Show Indicação": string | null
          "No Show Outros": string | null
          "NoShow Inbound": string | null
          "NoShow Outbound": string | null
          "Show Inbound": string | null
          "Show Indicação": string | null
          "Show Outbound": string | null
          "Show Outros": string | null
          "Vendas Inbound": string | null
          "Vendas indicação": string | null
          "Vendas Outbound": string | null
          "Vendas Outros": string | null
        }
        Insert: {
          Closer?: string | null
          Data?: string | null
          ID: number
          "Indicação Coletadas"?: string | null
          "No Show Indicação"?: string | null
          "No Show Outros"?: string | null
          "NoShow Inbound"?: string | null
          "NoShow Outbound"?: string | null
          "Show Inbound"?: string | null
          "Show Indicação"?: string | null
          "Show Outbound"?: string | null
          "Show Outros"?: string | null
          "Vendas Inbound"?: string | null
          "Vendas indicação"?: string | null
          "Vendas Outbound"?: string | null
          "Vendas Outros"?: string | null
        }
        Update: {
          Closer?: string | null
          Data?: string | null
          ID?: number
          "Indicação Coletadas"?: string | null
          "No Show Indicação"?: string | null
          "No Show Outros"?: string | null
          "NoShow Inbound"?: string | null
          "NoShow Outbound"?: string | null
          "Show Inbound"?: string | null
          "Show Indicação"?: string | null
          "Show Outbound"?: string | null
          "Show Outros"?: string | null
          "Vendas Inbound"?: string | null
          "Vendas indicação"?: string | null
          "Vendas Outbound"?: string | null
          "Vendas Outros"?: string | null
        }
        Relationships: []
      }
      "Controle Pre Venda": {
        Row: {
          Data: string | null
          "Empresas Ativadas": string | null
          ID: number
          "Ligações Atendidas": string | null
          "Ligações Realizadas": string | null
          "Marcadas Inbound": string | null
          "Marcadas Out": string | null
          "Marcadas Recom": string | null
          Noshow: string | null
          "Novas Conexões Stakeholder": string | null
          "Recomendações Coletadas": string | null
          Remarcadas: string | null
          SDR: string | null
          "Show Inbound": string | null
          "Show Out": string | null
          "Show Recom": string | null
          Tempo: string | null
        }
        Insert: {
          Data?: string | null
          "Empresas Ativadas"?: string | null
          ID: number
          "Ligações Atendidas"?: string | null
          "Ligações Realizadas"?: string | null
          "Marcadas Inbound"?: string | null
          "Marcadas Out"?: string | null
          "Marcadas Recom"?: string | null
          Noshow?: string | null
          "Novas Conexões Stakeholder"?: string | null
          "Recomendações Coletadas"?: string | null
          Remarcadas?: string | null
          SDR?: string | null
          "Show Inbound"?: string | null
          "Show Out"?: string | null
          "Show Recom"?: string | null
          Tempo?: string | null
        }
        Update: {
          Data?: string | null
          "Empresas Ativadas"?: string | null
          ID?: number
          "Ligações Atendidas"?: string | null
          "Ligações Realizadas"?: string | null
          "Marcadas Inbound"?: string | null
          "Marcadas Out"?: string | null
          "Marcadas Recom"?: string | null
          Noshow?: string | null
          "Novas Conexões Stakeholder"?: string | null
          "Recomendações Coletadas"?: string | null
          Remarcadas?: string | null
          SDR?: string | null
          "Show Inbound"?: string | null
          "Show Out"?: string | null
          "Show Recom"?: string | null
          Tempo?: string | null
        }
        Relationships: []
      }
      Leadbroker: {
        Row: {
          CANAL: string | null
          CNPJ: string | null
          "DATA DA COMPRA": string | null
          EMPRESAS: string | null
          FATURAMENTO: string | null
          ID: number
          "MOTIVO DE PERDA": string | null
          NOME: string | null
          PRODUTO: string | null
          SDR: string | null
          STATUS: string | null
          TELEFONE: string | null
          VALOR: string | null
        }
        Insert: {
          CANAL?: string | null
          CNPJ?: string | null
          "DATA DA COMPRA"?: string | null
          EMPRESAS?: string | null
          FATURAMENTO?: string | null
          ID: number
          "MOTIVO DE PERDA"?: string | null
          NOME?: string | null
          PRODUTO?: string | null
          SDR?: string | null
          STATUS?: string | null
          TELEFONE?: string | null
          VALOR?: string | null
        }
        Update: {
          CANAL?: string | null
          CNPJ?: string | null
          "DATA DA COMPRA"?: string | null
          EMPRESAS?: string | null
          FATURAMENTO?: string | null
          ID?: number
          "MOTIVO DE PERDA"?: string | null
          NOME?: string | null
          PRODUTO?: string | null
          SDR?: string | null
          STATUS?: string | null
          TELEFONE?: string | null
          VALOR?: string | null
        }
        Relationships: []
      }
      "Meta Closer": {
        Row: {
          Closer: string | null
          ID: number
          Mês: string | null
          Tipo: string | null
          Valor: number | null
        }
        Insert: {
          Closer?: string | null
          ID: number
          Mês?: string | null
          Tipo?: string | null
          Valor?: number | null
        }
        Update: {
          Closer?: string | null
          ID?: number
          Mês?: string | null
          Tipo?: string | null
          Valor?: number | null
        }
        Relationships: []
      }
      "Meta Empresa": {
        Row: {
          Canal: string | null
          ID: number
          Mês: string | null
          Tipo: string | null
          Valor: number | null
        }
        Insert: {
          Canal?: string | null
          ID: number
          Mês?: string | null
          Tipo?: string | null
          Valor?: number | null
        }
        Update: {
          Canal?: string | null
          ID?: number
          Mês?: string | null
          Tipo?: string | null
          Valor?: number | null
        }
        Relationships: []
      }
      "Meta Pre Venda": {
        Row: {
          ID: number
          Mês: string | null
          SDR: string | null
          Tipo: string | null
          Valor: number | null
        }
        Insert: {
          ID: number
          Mês?: string | null
          SDR?: string | null
          Tipo?: string | null
          Valor?: number | null
        }
        Update: {
          ID?: number
          Mês?: string | null
          SDR?: string | null
          Tipo?: string | null
          Valor?: number | null
        }
        Relationships: []
      }
      Negociacoes: {
        Row: {
          BANT: number | null
          CLOSER: string | null
          CNPJ: string | null
          "CONEXÃO STAKE": string | null
          "CURVA DIAS": string | null
          "DATA 1º PGTO": string | null
          "DATA AGENDAMENTO": string | null
          "DATA DA CALL": string | null
          "DATA DA REUNIÃO": string | null
          "DATA DO FEC.": string | null
          "DATA RETOMADA": string | null
          DEADLINE: string | null
          EMPRRESA: string | null
          ID: number
          "LINK CONTRATO": string | null
          "MÊS COMPRA": string | null
          "MÊS REUNIÃO": string | null
          "MÊS VENDA": string | null
          "MOTIVOS DE PERDA": string | null
          OBSERVAÇÕES: string | null
          ORIGEM: string | null
          PRODUTO: string | null
          "REUNIÃO MARCADA": string | null
          "REUNIÃO REALIZADA": string | null
          STATUS: string | null
          TEMPERATURA: string | null
          TEMPERATURA_1: string | null
          "TEMPO DE FUNIL": string | null
          VALOR: string | null
          "VERIF. CNPJ": string | null
        }
        Insert: {
          BANT?: number | null
          CLOSER?: string | null
          CNPJ?: string | null
          "CONEXÃO STAKE"?: string | null
          "CURVA DIAS"?: string | null
          "DATA 1º PGTO"?: string | null
          "DATA AGENDAMENTO"?: string | null
          "DATA DA CALL"?: string | null
          "DATA DA REUNIÃO"?: string | null
          "DATA DO FEC."?: string | null
          "DATA RETOMADA"?: string | null
          DEADLINE?: string | null
          EMPRRESA?: string | null
          ID: number
          "LINK CONTRATO"?: string | null
          "MÊS COMPRA"?: string | null
          "MÊS REUNIÃO"?: string | null
          "MÊS VENDA"?: string | null
          "MOTIVOS DE PERDA"?: string | null
          OBSERVAÇÕES?: string | null
          ORIGEM?: string | null
          PRODUTO?: string | null
          "REUNIÃO MARCADA"?: string | null
          "REUNIÃO REALIZADA"?: string | null
          STATUS?: string | null
          TEMPERATURA?: string | null
          TEMPERATURA_1?: string | null
          "TEMPO DE FUNIL"?: string | null
          VALOR?: string | null
          "VERIF. CNPJ"?: string | null
        }
        Update: {
          BANT?: number | null
          CLOSER?: string | null
          CNPJ?: string | null
          "CONEXÃO STAKE"?: string | null
          "CURVA DIAS"?: string | null
          "DATA 1º PGTO"?: string | null
          "DATA AGENDAMENTO"?: string | null
          "DATA DA CALL"?: string | null
          "DATA DA REUNIÃO"?: string | null
          "DATA DO FEC."?: string | null
          "DATA RETOMADA"?: string | null
          DEADLINE?: string | null
          EMPRRESA?: string | null
          ID?: number
          "LINK CONTRATO"?: string | null
          "MÊS COMPRA"?: string | null
          "MÊS REUNIÃO"?: string | null
          "MÊS VENDA"?: string | null
          "MOTIVOS DE PERDA"?: string | null
          OBSERVAÇÕES?: string | null
          ORIGEM?: string | null
          PRODUTO?: string | null
          "REUNIÃO MARCADA"?: string | null
          "REUNIÃO REALIZADA"?: string | null
          STATUS?: string | null
          TEMPERATURA?: string | null
          TEMPERATURA_1?: string | null
          "TEMPO DE FUNIL"?: string | null
          VALOR?: string | null
          "VERIF. CNPJ"?: string | null
        }
        Relationships: []
      }
      Outbound: {
        Row: {
          BDR: string | null
          CNPJ: string | null
          "DATA DO AGENDAMENTO": string | null
          EMPRESAS: string | null
          ID: number
          NOME: string | null
          STATUS: string | null
          TELEFONE: string | null
        }
        Insert: {
          BDR?: string | null
          CNPJ?: string | null
          "DATA DO AGENDAMENTO"?: string | null
          EMPRESAS?: string | null
          ID: number
          NOME?: string | null
          STATUS?: string | null
          TELEFONE?: string | null
        }
        Update: {
          BDR?: string | null
          CNPJ?: string | null
          "DATA DO AGENDAMENTO"?: string | null
          EMPRESAS?: string | null
          ID?: number
          NOME?: string | null
          STATUS?: string | null
          TELEFONE?: string | null
        }
        Relationships: []
      }
      Recomendacao: {
        Row: {
          BDR: string | null
          CLOSER: string | null
          CNPJ: string | null
          "DATA DA RECOMENDAÇÃO": string | null
          EMPRESA: string | null
          ID: number
          NOME: string | null
          "QUEM INDICOU": string | null
          STATUS: string | null
          TELEFONE: number | null
        }
        Insert: {
          BDR?: string | null
          CLOSER?: string | null
          CNPJ?: string | null
          "DATA DA RECOMENDAÇÃO"?: string | null
          EMPRESA?: string | null
          ID: number
          NOME?: string | null
          "QUEM INDICOU"?: string | null
          STATUS?: string | null
          TELEFONE?: number | null
        }
        Update: {
          BDR?: string | null
          CLOSER?: string | null
          CNPJ?: string | null
          "DATA DA RECOMENDAÇÃO"?: string | null
          EMPRESA?: string | null
          ID?: number
          NOME?: string | null
          "QUEM INDICOU"?: string | null
          STATUS?: string | null
          TELEFONE?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
