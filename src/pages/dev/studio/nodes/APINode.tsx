import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Server, Link2 } from 'lucide-react';

export const APINode = memo(({ data, selected }: NodeProps) => {
  const methodColors = {
    GET: 'text-green-500',
    POST: 'text-blue-500',
    PUT: 'text-yellow-500',
    DELETE: 'text-red-500',
  };

  return (
    <Card className={`p-3 min-w-[220px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <Server className="h-4 w-4" />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{data.label}</h3>
          <p className="text-xs text-muted-foreground">{data.endpoint}</p>
        </div>
        {data.isConnected && <Link2 className="h-4 w-4 text-green-500" />}
      </div>
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${methodColors[data.method]}`}>
            {data.method}
          </span>
          <span className="text-xs text-muted-foreground">{data.route}</span>
        </div>
        {data.params && (
          <div className="text-xs">
            <span className="text-muted-foreground">Params: </span>
            {Object.keys(data.params).join(', ')}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});
