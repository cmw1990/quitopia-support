import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Sparkles } from "lucide-react";

export const EyeRelaxationGuide = () => {
  const tips = [
    {
      title: "Adjust Screen Settings",
      description: "Optimize brightness and contrast, enable blue light filter"
    },
    {
      title: "Proper Distance",
      description: "Keep screen at arm's length (20-28 inches) from your eyes"
    },
    {
      title: "Blink Frequently",
      description: "Remember to blink often to prevent dry eyes"
    },
    {
      title: "Take Regular Breaks",
      description: "Follow the 20-20-20 rule throughout your day"
    },
    {
      title: "Proper Lighting",
      description: "Ensure your workspace has adequate, non-glare lighting"
    },
    {
      title: "Eye-Friendly Position",
      description: "Position your screen slightly below eye level"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Eye Care Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
            >
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                {tip.title}
              </h3>
              <p className="text-sm text-muted-foreground">{tip.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};