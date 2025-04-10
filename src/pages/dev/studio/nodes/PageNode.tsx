import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/ui/card';
import { FileCode2, Link2 } from 'lucide-react';

export const PageNode = memo(({ data, selected }: NodeProps) => {
  return (
    <Card className={`p-3 min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <FileCode2 className="h-4 w-4" />
        <div className="flex-1">
          <h3 className="text-sm font-medium">{data.label}</h3>
          <p className="text-xs text-muted-foreground">{data.route}</p>
        </div>
        {data.isConnected && <Link2 className="h-4 w-4 text-green-500" />}
      </div>
      <div className="mt-2 text-xs">
        <div className="flex justify-between text-muted-foreground">
          <span>Components: {data.components?.length || 0}</span>
          <span>Routes: {data.routes?.length || 0}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});
