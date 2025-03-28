import React, { useContext, useEffect, useState } from 'react';
import { 
  Routes, 
  Route,
  useParams,
  useNavigate,
  Navigate
} from 'react-router-dom';
import { RootLayout } from './components/layout/root-layout';
import { LandingPage } from './components/LandingPage';
import { ConsumptionLogger } from './components/ConsumptionLogger';
import { ProductDetails } from './components/NRTDirectory/ProductDetails';
import { getNicotineProducts, getCurrentSession } from './api/apiCompatibility';
import { getProductById } from './api/apiCompatibility';
import CommunityChallenges from './components/CommunityChallenges';
import Achievements from './components/Achievements';
import { SocialShareAnalytics } from './components/SocialShareAnalytics';
import { useAuth } from './components/AuthProvider';
import { Dashboard } from './components/Dashboard';
import { Progress } from './components/Progress';
import NRTDirectory from './components/NRTDirectory/NRTDirectory';
import { AlternativeProducts } from './components/AlternativeProducts';
import { GuidesHub } from './components/GuidesHub';
import { WebTools } from './components/WebTools';
import { Community } from './components/Community';
import { Settings } from './components/Settings';
import TaskManager from './components/TaskManager';
import TriggerAnalysis from './components/TriggerAnalysis';
import { LoginPage } from './components/LoginPage';
import { Session } from '@supabase/supabase-js';
import { DeepLinkHandler } from './components/DeepLinkHandler';
import { MoodTracker } from './components/health/MoodTracker';
import { EnergyTracker } from './components/health/EnergyTracker';
import { FocusTracker } from './components/health/FocusTracker';
import { HolisticDashboard } from './components/health/HolisticDashboard';
import { CravingTracker } from './components/health/CravingTracker';
import { IntegratedHealthView } from './components/health/IntegratedHealthView';
import { Journal } from './components/Journal';
import SupabaseTest from './components/SupabaseTest';
import OfflineTest from './components/OfflineTest';
import OfflineDocs from './components/OfflineDocs';
import gameRoutes from './routes/gameRoutes';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import { NRTProduct as BaseNRTProduct } from './components/NRTDirectory/nrt-types';
import { NRTProduct } from './components/NRTDirectory/types';
import { mapToNRTProduct } from './lib/mappers';
import { Toaster } from './components/ui/sonner';
import { TriggerInterventionPage } from './pages/TriggerInterventionPage';
import { interventionRoutes } from './routes/interventionRoutes';
import SleepQualityPage from './pages/SleepQualityPage';
import MainDashboard from './components/MainDashboard';
import PrivateMessaging from './components/community/PrivateMessaging';
import HealthcareReports from './components/analytics/HealthcareReports';
import { AdvancedAnalyticsDashboard } from './components/analytics/AdvancedAnalyticsDashboard';
import EnhancedSupportPage from './pages/EnhancedSupportPage';
import { WebToolsPage } from './features/webTools';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MultiProductTracker } from './features/nicotineTracking';
import { AppLayout } from './components/layout/app-layout';

// Higher Order Component to inject session prop from context
const withSession = <P extends { session: Session | null }>(
  Component: React.ComponentType<P>
) => {
  return (props: Omit<P, 'session'>) => {
    const auth = useAuth();
    return <Component {...props as any} session={auth.session} />;
  };
};

// Wrap all components that need session
const LandingPageWithSession = withSession(LandingPage);
const DashboardWithSession = withSession(Dashboard);
const ProgressWithSession = withSession(Progress);
const ConsumptionLoggerWithSession = withSession(ConsumptionLogger);
const NRTDirectoryWithSession = withSession(NRTDirectory);
const AlternativeProductsWithSession = withSession(AlternativeProducts);
const GuidesHubWithSession = withSession(GuidesHub);
const WebToolsWithSession = withSession(WebTools);
const CommunityWithSession = withSession(Community);
const SettingsWithSession = withSession(Settings);
const TaskManagerWithSession = withSession(TaskManager);
const TriggerAnalysisWithSession = withSession(TriggerAnalysis);
const CommunityChallengesWithSession = withSession(CommunityChallenges);
const AchievementsWithSession = withSession(Achievements);
const SocialShareAnalyticsWithSession = withSession(SocialShareAnalytics);
const MoodTrackerWithSession = withSession(MoodTracker);
const EnergyTrackerWithSession = withSession(EnergyTracker);
const FocusTrackerWithSession = withSession(FocusTracker);
const HolisticDashboardWithSession = withSession(HolisticDashboard);
const CravingTrackerWithSession = withSession(CravingTracker);
const JournalWithSession = withSession(Journal);
const SupabaseTestWithSession = withSession(SupabaseTest);
const OfflineTestWithSession = withSession(OfflineTest);
const OfflineDocsWithSession = withSession(OfflineDocs);
const AnalyticsDashboardWithSession = withSession(AnalyticsDashboard);
const SleepQualityPageWithSession = withSession(SleepQualityPage);
const MainDashboardWithSession = withSession(MainDashboard);
const PrivateMessagingWithSession = withSession(PrivateMessaging);
const HealthcareReportsWithSession = withSession(HealthcareReports);
const AdvancedAnalyticsDashboardWithSession = withSession(AdvancedAnalyticsDashboard);
const EnhancedSupportPageWithSession = withSession(EnhancedSupportPage);
const MultiProductTrackerWithSession = withSession(MultiProductTracker);
const IntegratedHealthViewWithSession = withSession(IntegratedHealthView);

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  
  if (auth.loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner />
    </div>;
  }
  
  if (!auth.session) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Product details wrapper component
const ProductDetailsWrapper = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const currentSession = await getCurrentSession();
        setSession(currentSession);
        
        if (!params.productId) {
          throw new Error('Product ID is required');
        }
        
        // Fetch the product by ID
        const productData = await getProductById(params.productId, currentSession);
        
        if (!productData) {
          throw new Error('Product not found');
        }
        
        // Map the API product to the NRTProduct type expected by ProductDetails
        const mappedProduct = mapToNRTProduct(productData);
        setProduct(mappedProduct as any);
      } catch (err) {
        console.error('Error loading product:', err);
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [params.productId, navigate]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Product</h2>
        <p className="text-muted-foreground">{error || 'Product not found'}</p>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => navigate('/products')}
        >
          Back to Products
        </button>
      </div>
    );
  }
  
  return (
    <ProductDetails 
      product={product} 
      session={session} 
      onBack={() => navigate(-1)}
    />
  );
};

// Router component using React Router v6
export const AppRouter = () => {
  const auth = useAuth();
  const session = auth.session || null;

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public route for the landing page */}
        <Route path="/" element={<LandingPage session={session} />} />
        
        {/* Public route for authentication */}
        <Route path="/auth" element={<LoginPage />} />
        
        {/* Public route for web tools */}
        <Route path="/tools" element={<WebToolsPage />} />
        <Route path="/tools/web" element={<WebToolsPage />} />
        
        {/* Public route for nicotine product catalog */}
        <Route path="/products/nicotine" element={<MultiProductTracker />} />
        
        {/* App routes under /app prefix with enhanced mobile layout - complying with SSOT8001 */}
        <Route 
          path="/app" 
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MainDashboardWithSession />} />
          <Route path="dashboard" element={<MainDashboardWithSession />} />
          
          {/* Progress tracking */}
          <Route path="progress" element={<ProgressWithSession />} />
          <Route path="consumption-logger" element={<ConsumptionLoggerWithSession />} />
          
          {/* Guides */}
          <Route path="guides" element={<GuidesHubWithSession />} />
          
          {/* Stats and Analytics */}
          <Route path="stats" element={<AnalyticsDashboardWithSession />} />
          <Route path="stats/advanced" element={<AdvancedAnalyticsDashboardWithSession />} />
          <Route path="stats/healthcare" element={<HealthcareReportsWithSession />} />
          
          {/* Profile and Settings */}
          <Route path="profile" element={<SettingsWithSession />} />
          <Route path="settings" element={<SettingsWithSession />} />
          
          {/* Other protected routes */}
          <Route path="products" element={<NRTDirectoryWithSession />} />
          <Route path="products/:productId" element={<ProductDetailsWrapper />} />
          <Route path="products/alternative" element={<AlternativeProductsWithSession />} />
          
          {/* Community */}
          <Route path="community" element={<CommunityWithSession />} />
          <Route path="community/challenges" element={<CommunityChallengesWithSession />} />
          <Route path="community/messages" element={<PrivateMessagingWithSession />} />
          
          {/* Health Tracking */}
          <Route path="health" element={<IntegratedHealthViewWithSession />} />
          <Route path="health/mood" element={<MoodTrackerWithSession />} />
          <Route path="health/energy" element={<EnergyTrackerWithSession />} />
          <Route path="health/focus" element={<FocusTrackerWithSession />} />
          <Route path="health/cravings" element={<CravingTrackerWithSession />} />
          <Route path="health/sleep" element={<SleepQualityPageWithSession />} />
          <Route path="health/dashboard" element={<HolisticDashboardWithSession />} />
          
          {/* Additional Routes */}
          <Route path="journal" element={<JournalWithSession />} />
          <Route path="triggers" element={<TriggerAnalysisWithSession />} />
          <Route path="achievements" element={<AchievementsWithSession />} />
          <Route path="share" element={<SocialShareAnalyticsWithSession />} />
          <Route path="tasks" element={<TaskManagerWithSession />} />
          <Route path="support" element={<EnhancedSupportPageWithSession />} />
          
          {/* Testing and Development */}
          <Route path="deep-link-test" element={<DeepLinkHandler />} />
          <Route path="offline" element={<OfflineTestWithSession />} />
          <Route path="offline/docs" element={<OfflineDocsWithSession />} />
          <Route path="supabase-test" element={<SupabaseTestWithSession />} />
        </Route>
        
        {/* Legacy app routes for backward compatibility */}
        <Route path="/app/legacy" element={<RootLayout />}>
          {/* ... existing routes ... */}
        </Route>
        
        {/* Fallback route - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default AppRouter;
