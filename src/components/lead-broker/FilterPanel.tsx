
import React from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  dateRangeLead: DateRange | undefined;
  setDateRangeLead: (range: DateRange | undefined) => void;
  dateRangeSale: DateRange | undefined;
  setDateRangeSale: (range: DateRange | undefined) => void;
  selectedChannel: string;
  setSelectedChannel: (channel: string) => void;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  dateRangeLead,
  setDateRangeLead,
  dateRangeSale,
  setDateRangeSale,
  selectedChannel,
  setSelectedChannel,
  selectedProduct,
  setSelectedProduct,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <DateRangePicker
        dateRange={dateRangeLead}
        onDateRangeChange={setDateRangeLead}
        label="Período Compra Lead (Broker)"
      />
      <DateRangePicker
        dateRange={dateRangeSale}
        onDateRangeChange={setDateRangeSale}
        label="Período Fechamento Venda (Broker)"
      />
      <div className="grid gap-2">
        <div className="text-sm font-medium">Canal (Broker)</div>
        <Select 
          value={selectedChannel} 
          onValueChange={setSelectedChannel}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar Canal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Canais (Broker)</SelectItem>
            <SelectItem value="FACEBOOK">FACEBOOK</SelectItem>
            <SelectItem value="GOOGLE">GOOGLE</SelectItem>
            <SelectItem value="INSTITUCIONAL">INSTITUCIONAL</SelectItem>
            <SelectItem value="BING">BING</SelectItem>
            <SelectItem value="LINKEDIN">LINKEDIN</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2">
        <div className="text-sm font-medium">Produto (Broker)</div>
        <Select 
          value={selectedProduct} 
          onValueChange={setSelectedProduct}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecionar Produto" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Produtos (Broker)</SelectItem>
            <SelectItem value="ESTRUTURAÇÃO ESTRATÉGICA">ESTRUTURAÇÃO ESTRATÉGICA</SelectItem>
            <SelectItem value="ASSESSORIA">ASSESSORIA</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
