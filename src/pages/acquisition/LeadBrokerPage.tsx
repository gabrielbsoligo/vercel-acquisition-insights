
import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useLeadBrokerData } from "@/hooks/useLeadBrokerData";
import { KpiSummary } from "@/components/lead-broker/KpiSummary";
import { FilterPanel } from "@/components/lead-broker/FilterPanel";
import { ConversionFunnel } from "@/components/lead-broker/ConversionFunnel";
import { TrendChart } from "@/components/lead-broker/TrendChart";
import { ChannelTable } from "@/components/lead-broker/ChannelTable";
import { ProductTable } from "@/components/lead-broker/ProductTable";
import { QualityConversionChart } from "@/components/lead-broker/QualityConversionChart";
import { LoadingState } from "@/components/lead-broker/LoadingState";
import { NoDataState } from "@/components/lead-broker/NoDataState";

const LeadBrokerPage: React.FC = () => {
  const {
    dateRangeLead,
    setDateRangeLead,
    dateRangeSale,
    setDateRangeSale,
    selectedChannel,
    setSelectedChannel,
    selectedProduct,
    setSelectedProduct,
    
    leadBrokerData,
    channelPerformanceData,
    productPerformanceData,
    qualityConversionData,
    trendData,
    funnelData,
    summaryKPIs,
    
    isLoading,
  } = useLeadBrokerData();

  return (
    <DashboardLayout title="Análise de Performance: Lead Broker">
      {/* Filters */}
      <FilterPanel
        dateRangeLead={dateRangeLead}
        setDateRangeLead={setDateRangeLead}
        dateRangeSale={dateRangeSale}
        setDateRangeSale={setDateRangeSale}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
      />

      {/* KPI Summary */}
      <KpiSummary summaryKPIs={summaryKPIs} />

      {/* Loading state */}
      {isLoading && <LoadingState />}

      {/* No data state */}
      {!isLoading && leadBrokerData && leadBrokerData.length === 0 && <NoDataState />}

      {/* Dashboard content - only render when data is available */}
      {!isLoading && leadBrokerData && leadBrokerData.length > 0 && (
        <>
          {/* Conversion Funnel */}
          <ConversionFunnel funnelData={funnelData} />

          {/* Trend Chart */}
          <TrendChart trendData={trendData} />

          {/* Channel Performance */}
          <ChannelTable 
            channelData={channelPerformanceData || []} 
            summaryKPIs={summaryKPIs} 
          />

          {/* Product Performance */}
          <ProductTable 
            productData={productPerformanceData || []} 
            summaryKPIs={summaryKPIs} 
          />

          {/* Lead Quality Analysis */}
          <QualityConversionChart qualityData={qualityConversionData || []} />
        </>
      )}
    </DashboardLayout>
  );
};

export default LeadBrokerPage;
