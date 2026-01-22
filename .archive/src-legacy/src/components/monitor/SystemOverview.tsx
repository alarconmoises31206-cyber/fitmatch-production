import { SystemHealthReport } from '@/types/monitoring';
import { Shield, Cpu, Database, Clock } from 'lucide-react';

interface SystemOverviewProps {
  healthData: SystemHealthReport;
}

export default function SystemOverview({ healthData }: SystemOverviewProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (healthy: boolean) => {
    return healthy ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          System Overview
        </h2>
        <span className="text-sm text-gray-500">
          Updated: {new Date(healthData.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Version Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Version</span>
          </div>
          <div className="flex items-center">
            <code className="text-lg font-mono font-bold text-gray-800">
              v{healthData.version}
            </code>
          </div>
        </div>
        
        {/* Uptime Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Uptime</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {formatUptime(healthData.uptime)}
          </p>
        </div>
        
        {/* Database Health Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Database</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${getStatusColor(healthData.db.healthy)}`}>
              {healthData.db.healthy ? 'Healthy' : 'Unhealthy'}
            </span>
            {healthData.db.latency && (
              <span className="text-sm text-gray-500">
                {healthData.db.latency}ms
              </span>
            )}
          </div>
        </div>
        
        {/* Redis Health Card */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Redis</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-lg font-bold ${getStatusColor(healthData.redis.healthy)}`}>
              {healthData.redis.healthy ? 'Healthy' : 'Unhealthy'}
            </span>
            {healthData.redis.latency && (
              <span className="text-sm text-gray-500">
                {healthData.redis.latency}ms
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Events Processed */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Events Processed (Last Hour)</span>
          <span className="text-lg font-bold text-gray-800">
            {healthData.eventsProcessedLastHour?.toLocaleString() || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
