import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TriggerAnalysis from '../TriggerAnalysis';
import { vi, describe, it, expect } from 'vitest';
import { Session } from '@supabase/supabase-js';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          data: [
            {
              id: 1,
              created_at: '2025-01-01T12:00:00',
              trigger_type: 'stress',
              trigger_details: 'Work deadline',
              intensity: 8,
              coping_strategy_used: 'Deep breathing',
              effectiveness: 6,
              user_id: 'test-user-id',
            },
            {
              id: 2,
              created_at: '2025-01-02T14:00:00',
              trigger_type: 'social',
              trigger_details: 'Friend smoking',
              intensity: 7,
              coping_strategy_used: 'Distraction',
              effectiveness: 5,
              user_id: 'test-user-id',
            },
          ],
          error: null,
        }),
      }),
      insert: () => ({
        select: () => ({
          data: { id: 3 },
          error: null,
        }),
      }),
    }),
    auth: {
      getSession: () => ({
        data: {
          session: {
            user: { id: 'test-user-id' },
          },
        },
        error: null,
      }),
    },
  }),
}));

// Mock the recharts library
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
    Pie: () => <div data-testid="pie"></div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
    Line: () => <div data-testid="line"></div>,
    XAxis: () => <div data-testid="x-axis"></div>,
    YAxis: () => <div data-testid="y-axis"></div>,
    Tooltip: () => <div data-testid="tooltip"></div>,
    Legend: () => <div data-testid="legend"></div>,
  };
});

describe('TriggerAnalysis Component', () => {
  const mockSession = {
    user: { id: 'test-user-id' },
    access_token: 'test-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer'
  } as Session;

  it('renders the component correctly', async () => {
    render(<TriggerAnalysis session={mockSession} />);
    
    // Check that the title is rendered
    expect(screen.getByText(/Trigger Analysis/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Stress/i)).toBeInTheDocument();
      expect(screen.getByText(/Social/i)).toBeInTheDocument();
    });
    
    // Check that charts are rendered
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('allows adding a new trigger', async () => {
    render(<TriggerAnalysis session={mockSession} />);
    
    // Click the "Log New Trigger" button
    fireEvent.click(screen.getByText(/Log New Trigger/i));
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Trigger Type/i), { target: { value: 'emotional' } });
    fireEvent.change(screen.getByLabelText(/Details/i), { target: { value: 'Feeling sad' } });
    fireEvent.change(screen.getByLabelText(/Intensity/i), { target: { value: '7' } });
    
    // Submit the form
    fireEvent.click(screen.getByText(/Save/i));
    
    // Check that the form was submitted successfully
    await waitFor(() => {
      expect(screen.getByText(/Trigger logged successfully/i)).toBeInTheDocument();
    });
  });

  it('displays coping strategies', async () => {
    render(<TriggerAnalysis session={mockSession} />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/Recommended Coping Strategies/i)).toBeInTheDocument();
    });
    
    // Check that strategies are displayed
    expect(screen.getByText(/Deep breathing/i)).toBeInTheDocument();
    expect(screen.getByText(/Distraction/i)).toBeInTheDocument();
  });
}); 