# TypeScript Errors Report

## Summary

- Total errors: 206
- Fixable errors: 21
- Files with errors: 205

## Errors by Category

### OTHER (152)

- `src/api/analyticsClient.ts(106,12):NaN`: 'data' is of type 'unknown'.
- `src/api/analyticsClient.ts(144,12):NaN`: 'data' is of type 'unknown'.
- `src/api/analyticsClient.ts(354,47):NaN`: Property 'getItem' does not exist on type 'OfflineStatusResult'.
- `src/api/analyticsClient.ts(368,64):NaN`: Expected 3 arguments, but got 4.
- `src/api/analyticsClient.ts(371,26):NaN`: Property 'setItem' does not exist on type 'OfflineStatusResult'.
- *(147 more...)*

### TYPE_MISMATCH (22)

- `src/api/analyticsClient.ts(141,7):NaN`: Argument of type 'Session | null | undefined' is not assignable to parameter of type 'Session | null'.
- `src/components/Analytics.tsx(120,22):NaN`: Argument of type 'unknown[]' is not assignable to parameter of type 'SetStateAction<SalesData[]>'.
- `src/components/health/HealthImprovementTimeline.tsx(192,67):NaN`: Argument of type 'string' is not assignable to parameter of type 'Session'.
- `src/components/health/HealthImprovementTimeline.tsx(284,23):NaN`: Argument of type '{ title: string; description: string; duration_minutes: number; }' is not assignable to parameter of type 'never'.
- `src/components/health/HealthImprovementTimeline.tsx(292,23):NaN`: Argument of type '{ title: string; description: string; duration_minutes: number; }' is not assignable to parameter of type 'never'.
- *(17 more...)*

### MODULE_EXPORT (15)

- `src/bootstrap.tsx(6,10):NaN`: Module '"./index"' has no exported member 'MountConfig'.
- `src/components/health/StepRewards.tsx(57,3):NaN`: Module '"../../api/missionFreshApiClient"' has no exported member 'getUserStepData'. Did you mean to use 'import getUserStepData from "../../api/missionFreshApiClient"' instead?
- `src/components/health/StepRewards.tsx(58,3):NaN`: Module '"../../api/missionFreshApiClient"' has no exported member 'calculateStepRewards'. Did you mean to use 'import calculateStepRewards from "../../api/missionFreshApiClient"' instead?
- `src/components/health/StepRewards.tsx(59,3):NaN`: Module '"../../api/missionFreshApiClient"' has no exported member 'connectHealthApp'. Did you mean to use 'import connectHealthApp from "../../api/missionFreshApiClient"' instead?
- `src/components/health/StepRewards.tsx(60,3):NaN`: Module '"../../api/missionFreshApiClient"' has no exported member 'disconnectHealthApp'. Did you mean to use 'import disconnectHealthApp from "../../api/missionFreshApiClient"' instead?
- *(10 more...)*

### MODULE_IMPORT (10)

- `src/components/__tests__/CommunityChallenges.test.tsx(1,54):NaN`: Cannot find module 'vitest' or its corresponding type declarations.
- `src/components/__tests__/CommunityChallenges.test.tsx(2,52):NaN`: Cannot find module '@testing-library/react' or its corresponding type declarations.
- `src/components/__tests__/TriggerAnalysis.test.tsx(2,52):NaN`: Cannot find module '@testing-library/react' or its corresponding type declarations.
- `src/components/__tests__/TriggerAnalysis.test.tsx(5,42):NaN`: Cannot find module 'vitest' or its corresponding type declarations.
- `src/components/App.tsx(11,23):NaN`: Cannot find module './auth/LoginPage' or its corresponding type declarations.
- *(5 more...)*

### DEFAULT_EXPORT (3)

- `src/components/App.tsx(17,8):NaN`: Module '"/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/OfflineIndicator"' has no default export. Did you mean to use 'import { OfflineIndicator } from "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/OfflineIndicator"' instead?
- `src/layouts/MissionFreshLayout.tsx(6,8):NaN`: Module '"/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/OfflineIndicator"' has no default export. Did you mean to use 'import { OfflineIndicator } from "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/OfflineIndicator"' instead?
- `src/MissionFreshApp.tsx(12,8):NaN`: Module '"/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/OfflineIndicator"' has no default export. Did you mean to use 'import { OfflineIndicator } from "/Users/guoweijiang/Downloads/(5001) mission-fresh/micro-frontends/mission-fresh/src/components/OfflineIndicator"' instead?

### UNKNOWN_TYPE (4)

- `src/components/SocialShareAnalytics.tsx(353,43):NaN`: Object is of type 'unknown'.
- `src/components/SocialShareAnalytics.tsx(353,50):NaN`: Object is of type 'unknown'.
- `src/components/SocialShareAnalytics.tsx(365,43):NaN`: Object is of type 'unknown'.
- `src/components/SocialShareAnalytics.tsx(365,50):NaN`: Object is of type 'unknown'.

## Files with Most Errors

- src/api/supabase-client.ts(17,5): 2 errors
- src/api/analyticsClient.ts(106,12): 1 errors
- src/api/analyticsClient.ts(141,7): 1 errors
- src/api/analyticsClient.ts(144,12): 1 errors
- src/api/analyticsClient.ts(354,47): 1 errors
- src/api/analyticsClient.ts(368,64): 1 errors
- src/api/analyticsClient.ts(371,26): 1 errors
- src/api/analyticsClient.ts(379,45): 1 errors
- src/api/supabase-client.ts(571,43): 1 errors
- src/api/supabase-client.ts(575,43): 1 errors

## Fixable Errors

- `src/components/Community.tsx(62,15):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/Community.tsx(66,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/Settings.tsx(160,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/Settings.tsx(185,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/Settings.tsx(188,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(252,11):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(258,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(276,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(279,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(389,11):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(395,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(413,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(416,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(550,11):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(556,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(575,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/components/WebTools.tsx(578,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/hooks/useQueries8001.ts(24,13):NaN`: Property 'error' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/hooks/useQueries8001.ts(71,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/hooks/useQueries8001.ts(156,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

- `src/hooks/useQueries8001.ts(160,13):NaN`: Property 'success' does not exist on type '({ ...props }: Toast) => { id: string; dismiss: () => void; update: (props: ToastType) => void; }'.
  - Suggested fix: Install react-hot-toast package. Add: import toast from 'react-hot-toast'
  - Automated: No

