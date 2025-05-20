
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/services/utils/formatters";

interface Negotiation {
  ID: number;
  EMPRESA: string;
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
  
  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredNegotiations.length / itemsPerPage);
  
  // Get current items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredNegotiations.slice(indexOfFirstItem, indexOfLastItem);

  // Filter negotiations when search term or negotiations change
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredNegotiations(negotiations);
      setCurrentPage(1); // Reset to first page when filter changes
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    const filtered = negotiations.filter(negotiation => 
      (negotiation.EMPRESA?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (negotiation.PRODUTO?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (negotiation.CLOSER?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (negotiation.ORIGEM?.toLowerCase() || '').includes(lowerSearchTerm) ||
      (negotiation.STATUS?.toLowerCase() || '').includes(lowerSearchTerm)
    );
    
    setFilteredNegotiations(filtered);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [searchTerm, negotiations]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

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

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxDisplayedPages = 5; // Maximum number of page links to display
    
    let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
    let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
    
    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxDisplayedPages) {
      startPage = Math.max(1, endPage - maxDisplayedPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            isActive={i === currentPage} 
            onClick={() => handlePageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
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
              {currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                    Nenhuma negociação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((negotiation) => (
                  <TableRow key={negotiation.ID}>
                    <TableCell className="font-medium">{negotiation.EMPRESA || '-'}</TableCell>
                    <TableCell>{negotiation.PRODUTO || '-'}</TableCell>
                    <TableCell>{formatCurrency(negotiation.VALOR || 0)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(negotiation.STATUS)}`}>
                        {negotiation.STATUS || '-'}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(negotiation["DATA_DA_CALL"])}</TableCell>
                    <TableCell>{formatDate(negotiation["DATA_DO_FEC"])}</TableCell>
                    <TableCell>{negotiation["CURVA_DIAS"] || '-'}</TableCell>
                    <TableCell>{negotiation.CLOSER || '-'}</TableCell>
                    <TableCell>{negotiation.ORIGEM || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {generatePaginationItems()}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        
        <div className="text-sm text-muted-foreground">
          Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredNegotiations.length)} de {filteredNegotiations.length} negociações
        </div>
      </div>
    </div>
  );
};
