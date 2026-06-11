import React, { Suspense, lazy, Component, type ReactNode } from 'react';
import { MasterHero3DFallback } from './MasterHero3DFallback';

const Inner = lazy(() => import('./MasterHero3DInner'));

class Hero3DErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return <MasterHero3DFallback />;
    return this.props.children;
  }
}

export const MasterHero3DCanvas: React.FC = () => (
  <Hero3DErrorBoundary>
    <Suspense fallback={<MasterHero3DFallback />}>
      <Inner />
    </Suspense>
  </Hero3DErrorBoundary>
);
