
import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/services/utils/formatters";

interface Negotiation {
  ID: number;
  EMPRESA: string;
  EMPRRESA: string; // Campo duplicado no banco
  PRODUTO: string;
  VALOR: number;
  STATUS: string;
  DATA_DA_CALL: string;
  CLOSER: string;
  ORIGEM: string;
  DATA_DO_FEC?: string;
  CURVA_DIAS?: number;
  MOTIVOS_DE_PERDA?: string;
}

interface NegotiationsListProps {
  negotiations: Negotiation[];
  isLoading: boolean;
}

export const NegotiationsList: React.FC<NegotiationsListProps> = ({
  negotiations,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredNegotiations, setFilteredNegotiations] = useState<Negotiation[]>(negotiations);

  // Filter negotiations when search term or negotiations change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNegotiations(negotiations);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const filtered = negotiations.filter(negotiation => 
      (negotiation.EMPRESA?.toLowerCase().includes(lowerSearchTerm) || 
       negotiation.EMPRRESA?.toLowerCase().includes(lowerSearchTerm)) ||
      negotiation.PRODUTO?.toLowerCase().includes(lowerSearchTerm) ||
      negotiation.CLOSER?.toLowerCase().includes(lowerSearchTerm) ||
      negotiation.ORIGEM?.toLowerCase().includes(lowerSearchTerm) ||
      negotiation.STATUS?.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredNegotiations(filtered);
  }, [searchTerm, negotiations]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return dateString;
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ganho':
      case 'finalizado':
      case 'contrato assinado':
      case 'contrato na rua':
        return 'bg-green-100 text-green-800';
      case 'perdido':
      case 'perda':
        return 'bg-red-100 text-red-800';
      case 'negociação':
        return 'bg-blue-100 text-blue-800';
      case 'follow longo':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para obter o nome da empresa (considerando os dois campos possíveis)
  const getCompanyName = (negotiation: Negotiation): string => {
    return negotiation.EMPRESA || negotiation.EMPRRESA || '-';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por empresa, produto, closer, origem ou status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Fechamento</TableHead>
                <TableHead>Ciclo (dias)</TableHead>
                <TableHead>Closer</TableHead>
                <TableHead>Origem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNegotiations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    Nenhuma negociação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredNegotiations.map((negotiation) => (
                  <TableRow key={negotiation.ID}>
                    <TableCell className="font-medium">{getCompanyName(negotiation)}</TableCell>
                    <TableCell>{negotiation.PRODUTO || '-'}</TableCell>
                    <TableCell>{formatCurrency(negotiation.VALOR || 0)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(negotiation.STATUS)}`}>
                        {negotiation.STATUS || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(negotiation.DATA_DA_CALL)}</TableCell>
                    <TableCell>{formatDate(negotiation.DATA_DO_FEC)}</TableCell>
                    <TableCell>{negotiation.CURVA_DIAS || '-'}</TableCell>
                    <TableCell>{negotiation.CLOSER || '-'}</TableCell>
                    <TableCell>{negotiation.ORIGEM || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground">
        Mostrando {filteredNegotiations.length} de {negotiations.length} negociações
      </div>
    </div>
  );
};
