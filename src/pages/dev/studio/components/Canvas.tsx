import React, { useState, useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { motion, Reorder } from 'framer-motion';
import { WireframeComponent } from '../types';
import { cn } from '@/lib/utils';

interface CanvasProps {
  viewport: 'desktop' | 'tablet' | 'mobile';
  components: WireframeComponent[];
  selectedComponent?: WireframeComponent;
  onSelect: (component: WireframeComponent) => void;
  onDelete: (id: string) => void;
}

const viewportSizes = {
  desktop: 'w-full h-full',
  tablet: 'w-[768px] h-[1024px]',
  mobile: 'w-[375px] h-[812px]'
};

export const Canvas: React.FC<CanvasProps> = ({
  viewport,
  components,
  selectedComponent,
  onSelect,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const [{ isOver }, drop] = useDrop({
    accept: 'component',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset) {
        // Convert coordinates to be relative to the canvas
        const canvasRect = document.getElementById('canvas')?.getBoundingClientRect();
        if (canvasRect) {
          const x = offset.x - canvasRect.left;
          const y = offset.y - canvasRect.top;
          return { x, y };
        }
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const renderComponent = useCallback((component: WireframeComponent) => {
    const isSelected = selectedComponent?.id === component.id;

    return (
      <motion.div
        key={component.id}
        layoutId={component.id}
        className={cn(
          'relative',
          isSelected && 'ring-2 ring-primary',
          component.props.className
        )}
        style={component.props.style}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(component);
        }}
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        {/* Component Content */}
        {component.type === 'text' && (
          <p {...component.props}>{component.props.children}</p>
        )}
        {component.type === 'button' && (
          <button {...component.props}>{component.props.children}</button>
        )}
        {component.type === 'input' && (
          <input {...component.props} />
        )}
        {component.type === 'card' && (
          <div {...component.props}>{component.props.children}</div>
        )}
        {component.type === 'image' && (
          <img {...component.props} alt={component.props.alt || ''} />
        )}
        {component.type === 'container' && (
          <div {...component.props}>
            {component.children?.map(child => renderComponent(child))}
          </div>
        )}

        {/* Selection overlay */}
        {isSelected && (
          <div className="absolute inset-0 ring-2 ring-primary pointer-events-none">
            <div className="absolute -top-4 -left-4 bg-primary text-white text-xs px-1 rounded">
              {component.name}
            </div>
          </div>
        )}
      </motion.div>
    );
  }, [selectedComponent, onSelect]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-8">
      <div
        ref={drop}
        id="canvas"
        className={cn(
          'bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300',
          viewportSizes[viewport],
          isOver && 'ring-2 ring-primary ring-dashed'
        )}
      >
        <Reorder.Group
          axis="y"
          values={components}
          onReorder={onSelect}
          className="w-full h-full relative"
        >
          {components.map(component => renderComponent(component))}
        </Reorder.Group>
      </div>
    </div>
  );
};

export default Canvas;
