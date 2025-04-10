import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useFatigue } from './AntiFatigueContext';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Bot, Brain, Coffee, Dumbbell, Heart, Send, Sparkles, Zap } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export function FatigueAssistant() {
  const { entries = [], strategies = [] } = useFatigue();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your personal fatigue assistant. I can help you understand your fatigue patterns and suggest strategies to manage them. How are you feeling today?",
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Get average fatigue levels across all entries
  const getAverageFatigueLevels = () => {
    if (!entries.length) return null;
    
    const sum = entries.reduce(
      (acc, entry) => {
        acc.mental += entry.mental_fatigue;
        acc.physical += entry.physical_fatigue;
        acc.emotional += entry.emotional_fatigue;
        acc.sensory += entry.sensory_fatigue;
        return acc;
      },
      { mental: 0, physical: 0, emotional: 0, sensory: 0 }
    );
    
    return {
      mental: Math.round((sum.mental / entries.length) * 10) / 10,
      physical: Math.round((sum.physical / entries.length) * 10) / 10,
      emotional: Math.round((sum.emotional / entries.length) * 10) / 10,
      sensory: Math.round((sum.sensory / entries.length) * 10) / 10,
    };
  };

  // Get most common activity context
  const getMostCommonContext = () => {
    if (!entries.length) return null;
    
    const contextCounts: Record<string, number> = {};
    entries.forEach(entry => {
      contextCounts[entry.activity_context] = (contextCounts[entry.activity_context] || 0) + 1;
    });
    
    let maxCount = 0;
    let mostCommonContext = '';
    
    Object.entries(contextCounts).forEach(([context, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonContext = context;
      }
    });
    
    return mostCommonContext;
  };

  // Get recommended strategies based on fatigue data
  const getRecommendedStrategies = () => {
    const avgLevels = getAverageFatigueLevels();
    if (!avgLevels) return [];
    
    // Determine highest fatigue type
    const fatigueTypes = [
      { type: 'mental', level: avgLevels.mental },
      { type: 'physical', level: avgLevels.physical },
      { type: 'emotional', level: avgLevels.emotional },
      { type: 'sensory', level: avgLevels.sensory },
    ];
    
    fatigueTypes.sort((a, b) => b.level - a.level);
    const primaryFatigueType = fatigueTypes[0].type as 'mental' | 'physical' | 'emotional' | 'sensory';
    
    // Filter strategies for the highest fatigue type
    return strategies
      .filter(strategy => 
        strategy.fatigue_type === primaryFatigueType &&
        strategy.effectiveness_rating >= 3
      )
      .sort((a, b) => b.effectiveness_rating - a.effectiveness_rating)
      .slice(0, 2);  // Return top 2 strategies
  };

  // Process user message and generate response
  const processMessage = async (userMessage: string) => {
    // Add user message to chat
    const userMessageObj: Message = {
      id: generateId(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessageObj]);
    setInputValue('');
    setIsProcessing(true);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate response based on user message
    let response = '';
    
    // Check for keywords in user message
    const normalizedMessage = userMessage.toLowerCase();
    
    if (normalizedMessage.includes('tired') || normalizedMessage.includes('exhausted')) {
      const avgLevels = getAverageFatigueLevels();
      if (avgLevels) {
        const highestType = Object.entries(avgLevels).sort((a, b) => b[1] - a[1])[0];
        response = `Based on your tracking data, it looks like your ${highestType[0]} fatigue tends to be highest (${highestType[1]}/10 on average). This can definitely contribute to feeling tired. Would you like some strategies to manage ${highestType[0]} fatigue?`;
      } else {
        response = "I notice you're feeling tired. Tracking your fatigue levels can help us understand patterns. Would you like to start tracking now?";
      }
    } else if (normalizedMessage.includes('strategy') || normalizedMessage.includes('recommend') || normalizedMessage.includes('suggest') || normalizedMessage.includes('help')) {
      const strategies = getRecommendedStrategies();
      if (strategies.length) {
        response = `Based on your fatigue patterns, here are two strategies that might help:\n\n1. ${strategies[0].name}: ${strategies[0].description}\n\n2. ${strategies[1].name}: ${strategies[1].description}\n\nWould you like more details about any of these?`;
      } else {
        response = "I'd love to suggest some strategies for you. To give personalized recommendations, I need some fatigue tracking data. Would you like to start tracking your fatigue levels?";
      }
    } else if (normalizedMessage.includes('pattern') || normalizedMessage.includes('trend') || normalizedMessage.includes('analysis')) {
      if (entries.length >= 3) {
        const avgLevels = getAverageFatigueLevels();
        const mostCommonContext = getMostCommonContext();
        response = `I've analyzed your fatigue data and found some patterns. Your average levels are:\n• Mental: ${avgLevels?.mental}/10\n• Physical: ${avgLevels?.physical}/10\n• Emotional: ${avgLevels?.emotional}/10\n• Sensory: ${avgLevels?.sensory}/10\n\nMost of your fatigue seems to occur during ${mostCommonContext} activities. Does that align with your experience?`;
      } else {
        response = "To analyze patterns in your fatigue, I need at least 3 days of tracking data. Would you like to start tracking your fatigue levels daily?";
      }
    } else if (normalizedMessage.includes('hello') || normalizedMessage.includes('hi') || normalizedMessage.includes('hey')) {
      response = "Hi there! I'm your personal fatigue assistant. I can help analyze your fatigue patterns and suggest management strategies. How are you feeling today?";
    } else {
      // Default responses if no keywords match
      const defaultResponses = [
        "I understand you're looking for support with fatigue management. To give you personalized advice, could you share more about when you typically feel most fatigued?",
        "Thanks for your message. To help you better, could you tell me which type of fatigue affects you most: mental, physical, emotional, or sensory?",
        "I'm here to help you manage fatigue more effectively. Have you noticed any patterns in when your energy levels drop during the day?",
        "To provide tailored support, it would help to know if there are specific activities or times when you feel most fatigued. Could you share some details?",
      ];
      
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Add assistant response to chat
    const assistantMessageObj: Message = {
      id: generateId(),
      content: response,
      sender: 'assistant',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, assistantMessageObj]);
    setIsProcessing(false);
  };

  // Handle send message
  const handleSendMessage = () => {
    if (inputValue.trim() && !isProcessing) {
      processMessage(inputValue.trim());
    }
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Fatigue Assistant
        </CardTitle>
        <CardDescription>
          Get personalized advice and insights about your fatigue patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[410px] pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div className="flex gap-3 max-w-[80%]">
                  {message.sender === 'assistant' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                    </div>
                    <div
                      className={`text-xs mt-1 text-muted-foreground ${
                        message.sender === 'user' ? 'text-right' : ''
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src="/avatar.png" />
                      <AvatarFallback className="bg-secondary">
                        {localStorage.getItem('userName')?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-4 pt-4">
        <div className="flex w-full items-center gap-2">
          <Textarea
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 min-h-[40px] max-h-[120px]"
            disabled={isProcessing}
          />
          <Button 
            size="icon" 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isProcessing}
            className="h-10 w-10 shrink-0"
          >
            {isProcessing ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 