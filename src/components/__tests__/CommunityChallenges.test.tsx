import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommunityChallenges from '../CommunityChallenges';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../utils/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis()
  }
}));

// Mock data
const mockChallenges = [
  {
    id: '1',
    title: 'No Smoking Week',
    description: 'Avoid smoking for a week',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'medium',
    reward_points: 100,
    participants_count: 120,
    tasks: [
      { id: '1', description: 'Skip morning cigarette', points: 10 },
      { id: '2', description: 'Use alternative stress relief', points: 15 }
    ]
  },
  {
    id: '2',
    title: 'Track Your Triggers',
    description: 'Identify and log your smoking triggers',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    difficulty: 'easy',
    reward_points: 50,
    participants_count: 85,
    tasks: [
      { id: '3', description: 'Log 3 triggers', points: 5 },
      { id: '4', description: 'Develop coping strategy', points: 10 }
    ]
  }
];

const mockUserProgress = [
  {
    challenge_id: '1',
    user_id: 'user123',
    joined_at: new Date().toISOString(),
    completed_tasks: ['1'],
    status: 'in_progress'
  }
];

// Test suite
describe('CommunityChallenges', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useAuth as any).mockReturnValue({
      session: { user: { id: 'user123' } },
      user: { id: 'user123' },
      isLoading: false
    });

    // Mock Supabase responses
    const mockFromSelect = vi.fn().mockReturnThis();
    const mockFromSingle = vi.fn().mockReturnThis();
    
    (mockFromSelect).mockResolvedValue({
      data: mockChallenges,
      error: null
    });

    (mockFromSingle).mockResolvedValue({
      data: mockUserProgress[0],
      error: null
    });

    // Mock the challenge tasks fetch
    (vi.mocked(mockFromSelect).mockResolvedValueOnce({
      data: mockChallenges.flatMap(c => c.tasks),
      error: null
    }));

    // Mock the user progress fetch
    (vi.mocked(mockFromSelect).mockResolvedValueOnce({
      data: mockUserProgress,
      error: null
    }));
  });

  it('renders the component with loading state', () => {
    (useAuth as any).mockReturnValue({
      session: { user: { id: 'user123' } },
      user: { id: 'user123' },
      isLoading: true
    });

    render(<CommunityChallenges />);
    expect(screen.getByText(/Loading challenges/i)).toBeInTheDocument();
  });

  it('displays challenges when data is loaded', async () => {
    render(<CommunityChallenges />);
    
    await waitFor(() => {
      expect(screen.getByText('No Smoking Week')).toBeInTheDocument();
      expect(screen.getByText('Track Your Triggers')).toBeInTheDocument();
    });
  });

  it('allows joining a challenge', async () => {
    // Mock the insert operation
    const mockInsert = vi.fn().mockReturnValue({
      data: { id: 'new-progress-id' },
      error: null
    });
    
    vi.mocked(mockInsert);

    render(<CommunityChallenges />);
    
    await waitFor(() => {
      expect(screen.getByText('Track Your Triggers')).toBeInTheDocument();
    });

    // Find and click the join button for the second challenge
    const joinButtons = screen.getAllByText(/Join Challenge/i);
    fireEvent.click(joinButtons[1]);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('joined the challenge'));
    });
  });

  it('allows completing a task', async () => {
    // Mock the update operation
    const mockUpdate = vi.fn().mockReturnValue({
      data: { id: 'progress-id', completed_tasks: ['1', '2'] },
      error: null
    });
    
    vi.mocked(mockUpdate);

    render(<CommunityChallenges />);
    
    await waitFor(() => {
      expect(screen.getByText('No Smoking Week')).toBeInTheDocument();
    });

    // Click on a challenge to see details
    fireEvent.click(screen.getByText('No Smoking Week'));

    // Find and click a task checkbox
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[1]); // Second task

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('completed'));
    });
  });
}); 