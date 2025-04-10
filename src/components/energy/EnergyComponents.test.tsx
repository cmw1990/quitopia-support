import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Setup mock auth context
const mockAuthContext = {
  session: {
    access_token: 'test-token',
    user: { id: 'test-user-id', email: 'test@example.com' }
  },
  user: { id: 'test-user-id', email: 'test@example.com' },
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  loading: false,
  error: null
};

// Mock the AuthContext to avoid dependency issues
vi.mock('../AuthProvider', () => ({
  useAuth: () => mockAuthContext
}));

// Create a mock toast hook
vi.mock('../hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Import components with named imports
import { EnhancedEnergyManagement } from './EnhancedEnergyManagement';
import { EnergyRecoveryRecommendations } from './EnergyRecoveryRecommendations';
import { AntiFatigueInterventions } from './AntiFatigueInterventions';
import { UltradianRhythmTracker } from './UltradianRhythmTracker';
import { FavoriteRecoveryStrategies } from './FavoriteRecoveryStrategies';

// Mock the API calls
vi.mock('../../api/supabase-rest', () => ({
  getEnergyStrategies: vi.fn().mockResolvedValue([
    {
      id: '1',
      strategy_name: 'Pomodoro Technique',
      description: 'Work for 25 minutes, then take a 5-minute break',
      energy_type: 'mental',
      effectiveness_rating: 9,
      contexts_used: ['work', 'study'],
      is_favorite: false,
      usage_count: 5
    },
    {
      id: '2',
      strategy_name: 'Desk Stretching',
      description: 'Simple stretches you can do at your desk',
      energy_type: 'physical',
      effectiveness_rating: 7,
      contexts_used: ['work', 'office'],
      is_favorite: true,
      usage_count: 3
    }
  ]),
  getUserStrategies: vi.fn().mockResolvedValue([]),
  toggleFavoriteStrategy: vi.fn().mockResolvedValue({}),
  incrementStrategyUsage: vi.fn().mockResolvedValue({}),
  getUserFavoriteStrategies: vi.fn().mockResolvedValue([]),
  supabaseRestCall: vi.fn().mockResolvedValue([]),
  energyManagementApi: {
    getAllRecoveryRecommendations: vi.fn().mockResolvedValue([
      {
        id: '1',
        energy_level: 'low',
        energy_type: 'mental',
        title: 'Pomodoro Technique',
        description: 'Work for 25 minutes, then take a 5-minute break',
        duration_minutes: 30,
        effectiveness_score: 9,
        suitable_contexts: ['work', 'study'],
        icon: 'Timer'
      },
      {
        id: '2',
        energy_level: 'medium',
        energy_type: 'physical',
        title: 'Desk Stretching',
        description: 'Simple stretches you can do at your desk',
        duration_minutes: 5,
        effectiveness_score: 7,
        suitable_contexts: ['work', 'office'],
        icon: 'Stretch'
      }
    ]),
    getRecoveryRecommendationsForType: vi.fn().mockResolvedValue([]),
    saveUserRecoveryStrategy: vi.fn().mockResolvedValue({}),
    markRecoveryStrategyComplete: vi.fn().mockResolvedValue({})
  }
}));

// Sample energy levels for testing
const testEnergyLevels = {
  mental: 60,
  physical: 70,
  emotional: 80,
  overall: 65
};

// Create a mock AuthProvider component
const AuthProvider = ({ children }: { children: React.ReactNode }) => (
  <div data-testid="auth-provider">{children}</div>
);

describe('Energy Management Component Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders EnhancedEnergyManagement component with tabs', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <EnhancedEnergyManagement />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the component and tabs render
    await waitFor(() => {
      expect(screen.getByText(/energy levels/i)).toBeInTheDocument();
      expect(screen.getByText(/recovery recommendations/i)).toBeInTheDocument();
      expect(screen.getByText(/anti-fatigue/i)).toBeInTheDocument();
      expect(screen.getByText(/ultradian rhythm/i)).toBeInTheDocument();
      expect(screen.getByText(/favorites/i)).toBeInTheDocument();
    });
  });

  it('renders EnergyRecoveryRecommendations and shows strategies', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <EnergyRecoveryRecommendations energyLevels={testEnergyLevels} />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the component loads strategies
    await waitFor(() => {
      expect(screen.getByText(/Pomodoro Technique/i)).toBeInTheDocument();
      expect(screen.getByText(/Desk Stretching/i)).toBeInTheDocument();
    });
  });

  it('allows filtering strategies by energy type', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <EnergyRecoveryRecommendations energyLevels={testEnergyLevels} />
        </AuthProvider>
      </MemoryRouter>
    );

    // Should show all strategies initially
    await waitFor(() => {
      expect(screen.getByText(/Pomodoro Technique/i)).toBeInTheDocument();
      expect(screen.getByText(/Desk Stretching/i)).toBeInTheDocument();
    });

    // Click the Mental tab
    const mentalTab = screen.getByRole('tab', { name: /mental/i });
    fireEvent.click(mentalTab);

    // Should only show mental strategies
    await waitFor(() => {
      expect(screen.getByText(/Pomodoro Technique/i)).toBeInTheDocument();
    });
  });

  it('renders UltradianRhythmTracker with charts', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <UltradianRhythmTracker />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the component renders with charts
    await waitFor(() => {
      expect(screen.getByText(/track your natural energy cycles/i, { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/energy level/i, { exact: false })).toBeInTheDocument();
    });
  });

  it('renders FavoriteRecoveryStrategies component', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <FavoriteRecoveryStrategies />
        </AuthProvider>
      </MemoryRouter>
    );

    // Check if the component renders with favorites section
    await waitFor(() => {
      expect(screen.getByText(/your favorite strategies/i, { exact: false })).toBeInTheDocument();
    });
  });
}); 