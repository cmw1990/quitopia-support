import { BrowserRouter, HashRouter } from 'react-router-dom';
import { DevelopmentModeIndicator } from './DevelopmentModeIndicator';
import { getPlatform } from '@/utils/platform';

export function DevelopmentModeWrapper() {
  const platform = getPlatform();
  const RouterComponent = platform === 'webapp' || platform === 'webtool' ? BrowserRouter : HashRouter;

  return (
    <RouterComponent>
      <DevelopmentModeIndicator />
    </RouterComponent>
  );
}
