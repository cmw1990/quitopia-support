import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { BrainCircuit, Lightbulb } from 'lucide-react'; // Icons

const CognitiveReframingGuide = () => {

    // TODO: Add more specific examples and potentially interactive elements

    return (
        <div className="container mx-auto py-8 px-4 max-w-3xl space-y-6">
            <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold">Cognitive Reframing Guide</h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Learn to identify and challenge unhelpful thought patterns.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                         <BrainCircuit className="h-5 w-5 text-primary" />
                         <span>Understanding Cognitive Reframing</span>
                    </CardTitle>
                     <CardDescription>
                         Cognitive reframing is a technique used to shift your perspective on a situation or thought to see it in a more positive or realistic light.
                     </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>Many automatic thoughts, especially when facing challenges related to ADHD (like procrastination or perceived failure), can be negative and self-defeating. These thoughts often aren't entirely accurate.</p>
                    <p>Reframing helps you step back, examine the evidence for and against the thought, and find alternative, more balanced perspectives. This can reduce negative emotions and empower more constructive action.</p>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                     <CardTitle className="text-lg flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                         <span>Common Techniques & Examples</span>
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                     <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>1. Identify the Automatic Thought</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Example Thought:</strong> "I'll never finish this project, I always mess things up."</p>
                                <p>Notice the thought when you feel stuck or overwhelmed.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>2. Examine the Evidence</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground space-y-1">
                                <p><strong>Evidence Against:</strong> "I've finished projects before, even difficult ones. I completed Task X last week. Messing up sometimes is normal."</p>
                                <p><strong>Evidence For:</strong> "I have struggled with procrastination on this project. I missed a deadline recently."</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>3. Challenge Catastrophizing/Absolutes</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground space-y-1">
                                <p>Words like "never" or "always" are rarely true. Is it *really* true you *never* finish things or *always* mess up?</p>
                                <p><strong>Challenge:</strong> "It feels like I won't finish, but it's not guaranteed. While I sometimes struggle, I don't *always* mess up."</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>4. Generate Alternative Thoughts</AccordionTrigger>
                            <AccordionContent className="text-sm text-muted-foreground space-y-1">
                                <p>Find a more balanced and helpful perspective.</p>
                                <p><strong>Alternative:</strong> "This project is challenging, and I'm feeling overwhelmed, but I have finished things before. I can break it down into smaller steps. Making mistakes is part of learning."</p>
                                <p><strong>Alternative 2:</strong> "Feeling stuck is uncomfortable, but it doesn't mean I can't succeed. What's one small action I can take right now?"</p>
                             </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="item-5">
                             <AccordionTrigger>5. Focus on Action</AccordionTrigger>
                             <AccordionContent className="text-sm text-muted-foreground space-y-1">
                                 <p>Shift from rumination to constructive action, even if small.</p>
                                 <p><strong>Action:</strong> "I will work on the outline for 15 minutes using the Focus Timer."</p>
                             </AccordionContent>
                         </AccordionItem>
                    </Accordion>
                 </CardContent>
            </Card>
             {/* TODO: Add interactive elements, like a thought record form */}
        </div>
    );
};

export default CognitiveReframingGuide; 