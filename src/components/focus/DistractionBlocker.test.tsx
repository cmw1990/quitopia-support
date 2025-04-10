import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DistractionBlocker } from './DistractionBlocker';
import { useDistractionManager } from '@/hooks/useDistractionManager';
import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock the custom hook
vi.mock('@/hooks/useDistractionManager', () => ({
  useDistractionManager: vi.fn()
}));

// Mock the router hooks
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn()
}));

describe('DistractionBlocker', () => {
  const mockState = {
    isBlockingEnabled: false,
    blockedSites: [
      {
        id: '1',
        user_id: 'test-user',
        domain: 'facebook.com',
        block_intensity: 'strict',
        category: 'social',
        days_active: ['monday', 'tuesday'],
        created_at: new Date().toISOString(),
        blockingSchedule: []
      }
    ],
    distractionPatterns: [],
    blockingStats: {
      totalBlocked: 10,
      todayBlocked: 5,
      mostCommonTime: '14:00',
      productivity: 75,
      streakDays: 3,
      improvementRate: 10,
      focusScore: 85
    },
    distractionLogs: [],
    environmentRecommendations: [],
    digitalGoals: [],
    selectedCategory: 'social',
    showScheduler: false,
    showAnalytics: false,
    showEnvironment: false,
    showJournal: false,
    showMinimalism: false
  };

  const mockActions = {
    addBlockedSite: vi.fn(),
    removeBlockedSite: vi.fn(),
    updateBlockedSite: vi.fn(),
    toggleBlocking: vi.fn(),
    updateDigitalGoal: vi.fn(),
    logDistraction: vi.fn(),
    toggleView: vi.fn(),
    setSelectedCategory: vi.fn(),
    refresh: vi.fn()
  };

  beforeEach(() => {
    (useDistractionManager as any).mockReturnValue({
      state: mockState,
      actions: mockActions
    });
  });

  it('renders without crashing', () => {
    render(<DistractionBlocker />);
    expect(screen.getByText('Distraction Blocker')).toBeInTheDocument();
  });

  it('toggles blocking state when switch is clicked', () => {
    render(<DistractionBlocker />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(mockActions.toggleBlocking).toHaveBeenCalled();
  });

  it('adds a new site when form is submitted', async () => {
    render(<DistractionBlocker />);
    const input = screen.getByPlaceholderText(/enter website/i);
    const addButton = screen.getByLabelText('Add site');

    await userEvent.type(input, 'twitter.com');
    await userEvent.click(addButton);

    expect(mockActions.addBlockedSite).toHaveBeenCalledWith('twitter.com');
  });

  it('removes a site when delete button is clicked', () => {
    render(<DistractionBlocker />);
    const removeButton = screen.getByLabelText('Remove site');
    fireEvent.click(removeButton);
    expect(mockActions.removeBlockedSite).toHaveBeenCalledWith('1');
  });

  it('shows the scheduler when calendar button is clicked', () => {
    render(<DistractionBlocker />);
    const calendarButton = screen.getByLabelText('Schedule blocking');
    fireEvent.click(calendarButton);
    expect(mockActions.toggleView).toHaveBeenCalledWith('showScheduler');
  });

  it('changes category when category button is clicked', () => {
    render(<DistractionBlocker />);
    const categoryButton = screen.getByRole('button', { name: 'Entertainment' });
    fireEvent.click(categoryButton);
    expect(mockActions.setSelectedCategory).toHaveBeenCalledWith('entertainment');
  });

  it('filters sites by selected category', () => {
    const state = {
      ...mockState,
      blockedSites: [
        { ...mockState.blockedSites[0] },
        {
          id: '2',
          user_id: 'test-user',
          domain: 'netflix.com',
          block_intensity: 'moderate',
          category: 'entertainment',
          days_active: ['monday'],
          created_at: new Date().toISOString(),
          blockingSchedule: []
        }
      ]
    };
    (useDistractionManager as any).mockReturnValue({ state, actions: mockActions });

    render(<DistractionBlocker />);
    expect(screen.getByText('facebook.com')).toBeInTheDocument();
    expect(screen.queryByText('netflix.com')).not.toBeInTheDocument();
  });

  it('shows analytics tab content when clicked', async () => {
    render(<DistractionBlocker />);
    const analyticsTab = screen.getByRole('tab', { name: /analytics/i });
    await userEvent.click(analyticsTab);
    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /analytics/i })).toBeInTheDocument();
    });
  });

  it('shows environment tab content when clicked', async () => {
    render(<DistractionBlocker />);
    const environmentTab = screen.getByRole('tab', { name: /environment/i });
    await userEvent.click(environmentTab);
    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /environment/i })).toBeInTheDocument();
    });
  });

  it('shows goals tab content when clicked', async () => {
    render(<DistractionBlocker />);
    const goalsTab = screen.getByRole('tab', { name: /goals/i });
    await userEvent.click(goalsTab);
    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /goals/i })).toBeInTheDocument();
    });
  });
});
