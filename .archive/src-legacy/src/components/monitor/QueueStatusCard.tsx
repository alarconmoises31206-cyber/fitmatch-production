import { QueueHealth } from '@/types/monitoring';
import { Inbox, AlertTriangle, CheckCircle } from 'lucide-react';

interface QueueStatusCardProps {
  queueName: string;
  queueHealth: QueueHealth;
}

export default function QueueStatusCard({ queueName, queueHealth }: QueueStatusCardProps) {
  const getQueueStatusColor = (size: number, deadSize: number = 0) => {
    if (deadSize > 0) return 'text-red-500';
    if (size > 50) return 'text-yellow-500';
    if (size > 0) return 'text-blue-500';
    return 'text-green-500';
  };

  const getQueueIcon = (size: number, deadSize: number = 0) => {
    if (deadSize > 0) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (size > 0) return <Inbox className="w-5 h-5 text-blue-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const formatSize = (size: number) => {
    if (size >= 1000) return `${(size / 1000).toFixed(1)}k`;
    return size.toString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {getQueueIcon(queueHealth.size || 0, queueHealth.deadSize || 0)}
          <h3 className="font-bold text-gray-800">{queueName}</h3>
        </div>
        <div className={`text-lg font-bold ${getQueueStatusColor(queueHealth.size || 0, queueHealth.deadSize || 0)}`}>
          {formatSize(queueHealth.size || 0)}
          {queueHealth.deadSize && queueHealth.deadSize > 0 && (
            <span className="text-sm text-red-500 ml-1">
              ({queueHealth.deadSize} dead)
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {/* Queue Size Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Queue Size</span>
            <span>{queueHealth.size || 0} items</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-full rounded-full ${
                (queueHealth.deadSize || 0) > 0 ? 'bg-red-500' :
                (queueHealth.size || 0) > 50 ? 'bg-yellow-500' :
                (queueHealth.size || 0) > 0 ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min(100, (queueHealth.size || 0) / 100 * 100)}%` 
              }}
            />
          </div>
        </div>
        
        {/* Dead Queue if exists */}
        {(queueHealth.deadSize || 0) > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Dead Queue</span>
              <span className="text-red-600">{queueHealth.deadSize} items</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-full bg-red-500 rounded-full"
                style={{ 
                  width: `${Math.min(100, (queueHealth.deadSize || 0) / 100 * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {/* Last Processed Time */}
        {queueHealth.lastProcessed && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="text-sm text-gray-600">Last Processed</span>
            <span className="text-sm text-gray-500">
              {new Date(queueHealth.lastProcessed).toLocaleTimeString()}
            </span>
          </div>
        )}
        
        {/* Processing Rate if available */}
        {queueHealth.processingRate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Processing Rate</span>
            <span className="text-sm font-medium text-gray-800">
              {queueHealth.processingRate.toFixed(1)}/min
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
