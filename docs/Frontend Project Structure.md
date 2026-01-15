# Frontend Project Structure

**Project**: Zimasa PeopleWell (ZPW) Web  
**Framework**: React + TypeScript + Vite  
**Testing**: Jest + React Testing Library  
**Date**: January 2026

---

## Overview

The ZPW frontend follows a **feature-based architecture** with clear separation of concerns. The structure is designed to support multiple domain modules (People, Org, Leave, Performance, Gamification, AI) while maintaining shared infrastructure and reusable components.

---

## Directory Structure

```
frontend/
├── public/                          # Static assets
│   ├── favicon.ico
│   └── ...
│
├── src/
│   ├── app/                         # Application shell & routing
│   │   ├── components/              # App-level components
│   │   │   ├── Footer.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── layouts/                 # Layout components
│   │   │   └── MainLayout.tsx
│   │   └── routes.tsx               # Route definitions
│   │
│   ├── features/                    # Domain feature modules
│   │   ├── people/                  # People Core module
│   │   │   ├── PeopleModule.tsx     # Module entry point
│   │   │   ├── employee/
│   │   │   │   ├── EmployeeList.tsx
│   │   │   │   ├── EmployeeDetail.tsx
│   │   │   │   ├── EmployeeForm.tsx
│   │   │   │   ├── EmployeeStatusHistory.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useEmployee.ts
│   │   │   │   └── types.ts
│   │   │   ├── person/
│   │   │   │   ├── PersonList.tsx
│   │   │   │   ├── PersonDetail.tsx
│   │   │   │   ├── PersonForm.tsx
│   │   │   │   ├── PersonSearch.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── usePerson.ts
│   │   │   │   └── types.ts
│   │   │   ├── contract/
│   │   │   │   ├── ContractForm.tsx
│   │   │   │   ├── ContractHistory.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useContract.ts
│   │   │   │   └── types.ts
│   │   │   ├── wellness/
│   │   │   │   ├── WellnessProfileView.tsx
│   │   │   │   ├── WellnessProfileForm.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useWellnessProfile.ts
│   │   │   │   └── types.ts
│   │   │   ├── dependent/
│   │   │   │   └── types.ts
│   │   │   ├── qualification/
│   │   │   │   └── types.ts
│   │   │   ├── employment-history/
│   │   │   │   └── types.ts
│   │   │   └── reports/
│   │   │       ├── JoinersLeaversReport.tsx
│   │   │       └── StatusChangeReport.tsx
│   │   │
│   │   ├── org/                     # Work Lattice module
│   │   │   ├── OrgModule.tsx
│   │   │   ├── org-unit/
│   │   │   │   ├── OrgUnitTree.tsx
│   │   │   │   ├── OrgUnitForm.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useOrgUnit.ts
│   │   │   ├── position/
│   │   │   │   ├── PositionList.tsx
│   │   │   │   ├── PositionForm.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── usePosition.ts
│   │   │   └── assignment/
│   │   │       ├── AssignmentList.tsx
│   │   │       ├── AssignmentForm.tsx
│   │   │       └── hooks/
│   │   │           └── useAssignment.ts
│   │   │
│   │   ├── leave/                   # Leave & Absence module
│   │   │   ├── LeaveModule.tsx
│   │   │   ├── leave-request/
│   │   │   │   ├── LeaveRequestList.tsx
│   │   │   │   ├── LeaveRequestForm.tsx
│   │   │   │   ├── LeaveRequestDetail.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useLeaveRequest.ts
│   │   │   ├── leave-balance/
│   │   │   │   ├── LeaveBalanceView.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useLeaveBalance.ts
│   │   │   └── leave-policy/
│   │   │       ├── LeavePolicyList.tsx
│   │   │       └── hooks/
│   │   │           └── useLeavePolicy.ts
│   │   │
│   │   ├── performance/              # Performance module
│   │   │   ├── PerformanceModule.tsx
│   │   │   ├── appraisal/
│   │   │   │   ├── AppraisalList.tsx
│   │   │   │   ├── AppraisalForm.tsx
│   │   │   │   ├── AppraisalDetail.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useAppraisal.ts
│   │   │   ├── checkin/
│   │   │   │   ├── CheckinList.tsx
│   │   │   │   ├── CheckinForm.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useCheckin.ts
│   │   │   └── cycle/
│   │   │       ├── CycleList.tsx
│   │   │       └── hooks/
│   │   │           └── useCycle.ts
│   │   │
│   │   ├── gamification/            # Gamification module
│   │   │   ├── GamificationModule.tsx
│   │   │   ├── points/
│   │   │   │   ├── PointsHistory.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── usePoints.ts
│   │   │   ├── badges/
│   │   │   │   ├── BadgeList.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useBadges.ts
│   │   │   └── challenges/
│   │   │       ├── ChallengeList.tsx
│   │   │       └── hooks/
│   │   │           └── useChallenges.ts
│   │   │
│   │   ├── ai/                      # AI module
│   │   │   ├── AIModule.tsx
│   │   │   ├── copilot/
│   │   │   │   ├── CopilotChat.tsx
│   │   │   │   └── hooks/
│   │   │   │       └── useCopilot.ts
│   │   │   └── hr-request/
│   │   │       ├── HRRequestList.tsx
│   │   │       └── hooks/
│   │   │           └── useHRRequest.ts
│   │   │
│   │   ├── ess/                     # Employee Self-Service
│   │   │   └── ESSModule.tsx
│   │   │
│   │   └── mss/                     # Manager Self-Service
│   │       └── MSSModule.tsx
│   │
│   ├── shared/                      # Shared utilities & components
│   │   ├── components/               # Reusable UI components
│   │   │   ├── DataTable.tsx        # Table component (TanStack Table)
│   │   │   ├── ErrorBoundary.tsx    # Error boundary wrapper
│   │   │   ├── FormField.tsx        # Form field wrapper
│   │   │   └── LoadingSpinner.tsx    # Loading indicator
│   │   │
│   │   ├── hooks/                   # Shared React hooks
│   │   │   ├── useAuth.ts           # Authentication hook
│   │   │   └── useTenant.ts         # Tenant context hook
│   │   │
│   │   └── lib/                     # Shared libraries & utilities
│   │       ├── api-client.ts        # API client (axios/fetch wrapper)
│   │       ├── api-endpoints.ts     # API endpoint definitions
│   │       ├── auth-context.tsx     # Auth context provider
│   │       ├── tenant-context.tsx   # Tenant context provider
│   │       ├── react-query.ts       # React Query configuration
│   │       └── utils.ts             # Utility functions
│   │
│   ├── ui/                          # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── dialog.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── i18n/                        # Internationalization
│   │   ├── config.ts                # i18next configuration
│   │   └── locales/
│   │       ├── en/
│   │       │   ├── common.json
│   │       │   ├── people.json
│   │       │   ├── org.json
│   │       │   └── ...
│   │       ├── kis/
│   │       │   └── ...
│   │       └── fr/
│   │           └── ...
│   │
│   ├── assets/                      # Static assets (images, fonts)
│   │
│   ├── test/                        # Test utilities & setup
│   │   ├── setup.ts                 # Jest setup file
│   │   ├── utils.tsx                # Test utilities (render helpers)
│   │   └── mocks/                   # Mock data & functions
│   │       ├── api-mocks.ts
│   │       └── handlers.ts          # MSW handlers
│   │
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
│
├── __tests__/                       # Test files (co-located or separate)
│   ├── app/
│   │   └── routes.test.tsx
│   ├── features/
│   │   └── people/
│   │       └── employee/
│   │           └── EmployeeList.test.tsx
│   └── shared/
│       └── components/
│           └── DataTable.test.tsx
│
├── jest.config.js                   # Jest configuration
├── jest.setup.js                    # Jest setup file
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS configuration
├── postcss.config.js                # PostCSS configuration
├── package.json
└── .eslintrc.json                   # ESLint configuration
```

---

## Architecture Principles

### 1. Feature-Based Organization

Each domain module (People, Org, Leave, etc.) is self-contained within `features/`:

- **Module entry point**: `{Module}Module.tsx` - Main component that exports routes and navigation
- **Sub-features**: Organized by entity (e.g., `employee/`, `person/`, `contract/`)
- **Hooks**: Custom React hooks for data fetching and state management (`hooks/`)
- **Types**: TypeScript type definitions (`types.ts`)

### 2. Shared Infrastructure

Common functionality lives in `shared/`:

- **Components**: Reusable UI components used across features
- **Hooks**: Shared React hooks (auth, tenant, etc.)
- **Lib**: Utilities, API client, context providers

### 3. UI Component Library

shadcn/ui components in `ui/`:

- Built on Radix UI primitives
- Styled with Tailwind CSS
- Accessible by default (WCAG 2.1 AA)

### 4. Testing Strategy

- **Unit tests**: Component logic, hooks, utilities
- **Integration tests**: Feature workflows, API interactions
- **E2E tests**: Full user journeys (Playwright)

---

## Testing with Jest

### Jest Configuration

**File**: `jest.config.js`

```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.{ts,tsx}',
    '**/*.{test,spec}.{ts,tsx}',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/test/**',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
};
```

### Jest Setup File

**File**: `jest.setup.js`

```javascript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from '@jest/globals';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
```

### Test Utilities

**File**: `src/test/utils.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

// Custom render function with providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => {
  const queryClient = createTestQueryClient();

  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            {children}
          </I18nextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
```

### Example Component Test

**File**: `src/features/people/employee/__tests__/EmployeeList.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'jest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { EmployeeList } from '../EmployeeList';
import { useEmployee } from '../hooks/useEmployee';

// Mock the hook
vi.mock('../hooks/useEmployee');

describe('EmployeeList', () => {
  const mockEmployees = [
    {
      empId: 1,
      empEmployeeNumber: 'EMP001',
      empPerId: 1,
      person: {
        perFirstName: 'John',
        perLastName: 'Doe',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders employee list', async () => {
    (useEmployee as jest.Mock).mockReturnValue({
      employees: mockEmployees,
      isLoading: false,
      error: null,
    });

    render(<EmployeeList tenantId={1} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('EMP001')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    (useEmployee as jest.Mock).mockReturnValue({
      employees: [],
      isLoading: true,
      error: null,
    });

    render(<EmployeeList tenantId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('handles error state', () => {
    (useEmployee as jest.Mock).mockReturnValue({
      employees: [],
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(<EmployeeList tenantId={1} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Example Hook Test

**File**: `src/features/people/employee/hooks/__tests__/useEmployee.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'jest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEmployee } from '../useEmployee';
import { employeeApi } from '@/shared/lib/api-endpoints';

// Mock API client
vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useEmployee', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  it('fetches employee list', async () => {
    const mockEmployees = [
      { empId: 1, empEmployeeNumber: 'EMP001' },
    ];

    const { apiClient } = await import('@/shared/lib/api-client');
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockEmployees,
    });

    const { result } = renderHook(
      () => useEmployee({ tenantId: 1 }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockEmployees);
  });
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2"
  }
}
```

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1",
    "@types/jest": "^29.5.11",
    "identity-obj-proxy": "^3.0.0"
  }
}
```

---

## File Naming Conventions

- **Components**: PascalCase (e.g., `EmployeeList.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useEmployee.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Types**: `types.ts` or `{Entity}Types.ts`
- **Tests**: `{Component}.test.tsx` or `{Component}.spec.tsx`
- **Stories**: `{Component}.stories.tsx` (if using Storybook)

---

## Import Path Aliases

Configured in `tsconfig.json` and `vite.config.ts`:

```typescript
// Absolute imports from src root
import { Button } from '@/ui/button';
import { useEmployee } from '@/features/people/employee/hooks/useEmployee';
import { apiClient } from '@/shared/lib/api-client';

// Relative imports for same directory
import { EmployeeForm } from './EmployeeForm';
```

---

## Module Structure Pattern

Each feature module follows this pattern:

```
feature-name/
├── {Feature}Module.tsx          # Module entry, exports routes
├── entity-name/
│   ├── {Entity}List.tsx        # List view
│   ├── {Entity}Detail.tsx       # Detail view
│   ├── {Entity}Form.tsx         # Create/Edit form
│   ├── hooks/
│   │   └── use{Entity}.ts       # Data fetching hook
│   └── types.ts                  # TypeScript types
└── __tests__/                   # Tests (optional co-location)
    └── {Entity}List.test.tsx
```

---

## State Management

### Server State
- **React Query** (`@tanstack/react-query`) for API data
- Custom hooks per entity (e.g., `useEmployee`, `usePerson`)

### Client State
- **React Context** for auth and tenant
- **React Hook Form** for form state
- **Local state** (`useState`) for UI-only state

### Global State (Minimal)
- **Redux Toolkit** only for:
  - Auth state
  - Tenant context
  - Global filters
- Avoid Redux for feature-specific state

---

## Routing

**File**: `src/app/routes.tsx`

```typescript
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { PeopleModule } from '@/features/people/PeopleModule';
import { OrgModule } from '@/features/org/OrgModule';
// ... other modules

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        path: 'people',
        element: <PeopleModule />,
        children: [
          { path: 'employees', element: <EmployeeList /> },
          { path: 'employees/:id', element: <EmployeeDetail /> },
          // ...
        ],
      },
      {
        path: 'org',
        element: <OrgModule />,
        // ...
      },
      // ... other modules
    ],
  },
]);
```

---

## API Integration

### API Client

**File**: `src/shared/lib/api-client.ts`

```typescript
import axios from 'axios';
import { getAuthToken } from './auth-context';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### API Endpoints

**File**: `src/shared/lib/api-endpoints.ts`

```typescript
export const employeeApi = {
  list: (tenantId: number) => `/people/employees?tenantId=${tenantId}`,
  detail: (id: number) => `/people/employees/${id}`,
  create: () => '/people/employees',
  update: (id: number) => `/people/employees/${id}`,
  delete: (id: number) => `/people/employees/${id}`,
};
```

---

## Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom theme in `tailwind.config.js`
- Component classes in `ui/` components

### Component Styling
- Use Tailwind utility classes
- Use `cn()` utility (from `clsx` + `tailwind-merge`) for conditional classes
- Avoid inline styles except for dynamic values

---

## Internationalization (i18n)

### Configuration

**File**: `src/i18n/config.ts`

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enCommon from './locales/en/common.json';
import kisCommon from './locales/kis/common.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    kis: { common: kisCommon },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

function EmployeeList() {
  const { t } = useTranslation('common');
  return <h1>{t('employees.title')}</h1>;
}
```

---

## Build & Deployment

### Development
```bash
npm run dev          # Start Vite dev server
```

### Production Build
```bash
npm run build       # TypeScript check + Vite build
npm run preview     # Preview production build
```

### Testing
```bash
npm test            # Run Jest tests
npm test:watch      # Watch mode
npm test:coverage   # Generate coverage report
```

---

## Notes

### Current State
- **Testing Framework**: Currently using **Vitest** (see `vitest.config.ts`)
- **Migration**: To switch to Jest, update `package.json` scripts and configuration files
- **Test Setup**: Test setup file exists at `src/test/setup.ts` (currently for Vitest)

### Migration from Vitest to Jest
If migrating from Vitest to Jest:
1. Install Jest dependencies (see Required Dependencies above)
2. Create `jest.config.js` and `jest.setup.js`
3. Update `package.json` scripts
4. Update test imports (`vitest` → `jest`)
5. Update test utilities if needed

---

## References

- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Query](https://tanstack.com/query)
- [Tailwind CSS](https://tailwindcss.com/)
