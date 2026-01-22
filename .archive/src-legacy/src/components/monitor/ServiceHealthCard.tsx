import { ServiceHealth } from '@/types/monitoring';
import { AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

interface ServiceHealthCardProps {
  serviceName: string;
  health: ServiceHealth;
}

export default function ServiceHealthCard({ serviceName, health }: ServiceHealthCardProps) {
  const getStatusConfig = (status: string, healthy: boolean) => {
    switch (true) {
      case healthy && status === 'OK':
        return {
          color: 'bg-green-50 border-green-200',
          textColor: 'text-green-700',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          label: 'Operational',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case status === 'DEGRADED':
        return {
          color: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700',
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          label: 'Degraded',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case status === 'FAILED':
        return {
          color: 'bg-red-50 border-red-200',
          textColor: 'text-red-700',
          icon: <XCircle className="w-5 h-5 text-red-500" />,
          label: 'Failed',
          badgeColor: 'bg-red-100 text-red-800'
        };
      default:
        return {
          color: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-700',
          icon: <HelpCircle className="w-5 h-5 text-gray-500" />,
          label: 'Unknown',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getCircuitBreakerConfig = (state: string) => {
    switch (state) {
      case 'CLOSED':
        return {
          color: 'bg-green-100 text-green-800',
          label: 'Closed'
        };
      case 'OPEN':
        return {
          color: 'bg-red-100 text-red-800',
          label: 'Open'
        };
      case 'HALF_OPEN':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Half-Open'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          label: state
        };
    }
  };

  const statusConfig = getStatusConfig(health.status, health.healthy);
  const circuitBreakerConfig = getCircuitBreakerConfig(health.circuitBreaker?.state || 'UNKNOWN');

  return (
    <div className={`${statusConfig.color} border rounded-lg p-4 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <h3 className="font-bold text-gray-800">{serviceName}</h3>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusConfig.badgeColor}`}>
          {statusConfig.label}
        </span>
      </div>
      
      <div className="space-y-2">
        {/* Circuit Breaker Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Circuit Breaker</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${circuitBreakerConfig.color}`}>
            {circuitBreakerConfig.label}
          </span>
        </div>
        
        {/* Failure Count */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Failures</span>
          <span className="font-medium text-gray-800">
            {health.failureCount || 0}
          </span>
        </div>
        
        {/* Last Check */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Last Check</span>
          <span className="text-sm text-gray-500">
            {health.lastChecked ? new Date(health.lastChecked).toLocaleTimeString() : 'Never'}
          </span>
        </div>
        
        {/* Response Time if available */}
        {health.responseTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Response Time</span>
            <span className="font-medium text-gray-800">
              {health.responseTime}ms
            </span>
          </div>
        )}
        
        {/* Error Message if present */}
        {health.error && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-red-600 font-mono truncate" title={health.error}>
              Error: {health.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
