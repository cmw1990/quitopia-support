import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

// Basic Input Field with Validation
export const ValidatedInput: React.FC<{
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  validation?: (value: string) => string | null;
}> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  validation 
}) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    
    if (validation) {
      const validationError = validation(newValue);
      setError(validationError);
    }
  };

  return (
    <div className="space-y-2">
      <label 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className={cn(
          "w-full",
          error && "border-red-500 focus:ring-red-500"
        )}
      />
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

// Enhanced Select Dropdown
export const EnhancedSelect: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  onSelect?: (value: string) => void;
}> = ({ label, options, onSelect }) => {
  const [selectedValue, setSelectedValue] = useState<string | undefined>(undefined);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onSelect?.(value);
  };

  return (
    <div className="space-y-2">
      <label 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <Select 
        value={selectedValue} 
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// Date Picker with Calendar
export const DatePickerWithCalendar: React.FC<{
  label: string;
  onDateSelect?: (date: Date | undefined) => void;
}> = ({ label, onDateSelect }) => {
  const [date, setDate] = useState<Date | undefined>(undefined);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onDateSelect?.(selectedDate);
  };

  return (
    <div className="space-y-2">
      <label 
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Form with Multiple Components
export const ComplexForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submission logic
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md"
    >
      <ValidatedInput 
        label="Full Name" 
        placeholder="Enter your full name"
        validation={(value) => 
          value.length < 2 ? "Name must be at least 2 characters" : null
        }
      />
      
      <ValidatedInput 
        label="Email" 
        type="email"
        placeholder="Enter your email"
        validation={(value) => 
          !/\S+@\S+\.\S+/.test(value) ? "Invalid email format" : null
        }
      />
      
      <EnhancedSelect 
        label="Priority" 
        options={[
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' }
        ]}
      />
      
      <DatePickerWithCalendar 
        label="Due Date" 
      />
      
      <Button type="submit" className="w-full">
        Submit
      </Button>
    </form>
  );
};