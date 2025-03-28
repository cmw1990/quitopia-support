declare module 'react-day-picker' {
  import * as React from 'react';

  export interface DayPickerProps {
    showOutsideDays?: boolean;
    className?: string;
    classNames?: {
      [key: string]: string;
    };
    selected?: Date | Date[] | { from: Date; to: Date };
    onSelect?: (date: Date | undefined) => void;
    month?: Date;
    defaultMonth?: Date;
    disabled?: Date[] | ((date: Date) => boolean);
    [key: string]: any;
  }

  export interface DayPickerSingleProps extends DayPickerProps {
    mode?: 'single';
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
  }

  export interface DayPickerRangeProps extends DayPickerProps {
    mode: 'range';
    selected?: { from: Date; to: Date };
    onSelect?: (range: { from: Date; to: Date } | undefined) => void;
  }

  export interface DayPickerMultipleProps extends DayPickerProps {
    mode: 'multiple';
    selected?: Date[];
    onSelect?: (dates: Date[] | undefined) => void;
  }

  export const DayPicker: React.FC<
    DayPickerSingleProps | DayPickerRangeProps | DayPickerMultipleProps
  >;

  export type DateRange = { from: Date; to: Date } | undefined;
}
