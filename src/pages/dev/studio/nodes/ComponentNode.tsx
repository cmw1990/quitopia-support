import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Box, Link2 } from 'lucide-react';

export const ComponentNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`p-3 min-w-[180px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <Box className="h-4 w-4" />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{data.label}</h3>
          <p className="text-xs text-muted-foreground">{data.type}</p>
        </div>
        {data.isConnected && <Link2 className="h-4 w-4 text-green-500" />}
      </div>
      <div className="mt-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Props: {Object.keys(data.props || {}).length}</span>
          <span>State: {Object.keys(data.state || {}).length}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});
