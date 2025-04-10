import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CapturedPiecesProps {
  pieces: { type: string; color: string }[];
  title: string;
  className?: string;
}

export const CapturedPieces = ({ pieces, title, className = '' }: CapturedPiecesProps) => {
  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ScrollArea className="h-[100px]">
        <div className="flex flex-wrap gap-2">
          {pieces.length === 0 ? (
            <div className="text-sm text-muted-foreground italic">
              No captured pieces
            </div>
          ) : (
            pieces.map((piece, index) => (
              <span
                key={index}
                className={`text-xl transition-transform hover:scale-110 ${
                  piece.color === 'black' ? 'text-gray-900' : 'text-red-600'
                }`}
              >
                {piece.type}
              </span>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};