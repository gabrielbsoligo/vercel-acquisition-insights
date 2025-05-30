
// Re-export all functions from individual service modules
export * from './sdrService';
export * from './closerService';
// Export from channelService with explicit naming to avoid conflicts
export { 
  fetchChannelsData,
  fetchChannelProductAnalysis,
  fetchChannelLossReasons,
  fetchChannelMonthlyProgress,
} from './channelService';
// Properly re-export the type with the export type syntax
export type { ChannelPerformance as ChannelSalesPerformance } from './channelService';
export * from './salesFunnelService';
export * from './utils/dateUtils';
export * from './utils/tableMapping';
export * from './metaService';
export * from './negociacoesService';
export * from './queryService';
export * from './leadBrokerService';
