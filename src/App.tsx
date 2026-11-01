import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { AssistantPanel } from './components/AssistantPanel';
import { BudgetTab } from './components/BudgetTab';
import { Header } from './components/Header';
import { Icon, type IconName } from './components/Icon';
import { PlanMasthead } from './components/PlanMasthead';
import { PlanSetup } from './components/PlanSetup';
import { ProgressPanel } from './components/ProgressPanel';
import { PrintSummary } from './components/PrintSummary';
import { TimelineTab } from './components/TimelineTab';
import { Toast } from './components/Toast';
import { EmptyState } from './components/ui';
import { todayISO } from './lib/today';
import type { Plan } from './schemas';
import { loadInitial, safeStorage, usePlanStore, type InitialLoad } from './state/planStore';

const VendorsTab = lazy(() => import('./components/VendorsTab'));
const IdeasPanel = lazy(() => import('./components/IdeasPanel'));

const TABS = [
  { id: 'setup', label: 'Plan setup', icon: 'pencil' },
  { id: 'budget', label: 'Budget', icon: 'wallet' },
  { id: 'timeline', label: 'Timeline', icon: 'route' },
  { id: 'vendors', label: 'Vendors', icon: 'store' },
] as const satisfies readonly { id: string; label: string; icon: IconName }[];
type TabId = (typeof TABS)[number]['id'];

function readInitial(): InitialLoad {
  return loadInitial(window.location.hash, safeStorage());
}

export default function App({
  initial,
  today: todayProp,
}: {
  initial?: InitialLoad;
  today?: string;
}) {
  const [boot] = useState<InitialLoad>(() => initial ?? readInitial());
  const [today] = useState(() => todayProp ?? todayISO());
  const { state, dispatch } = usePlanStore(boot);
  const [tab, setTab] = useState<TabId>(boot.plan ? 'budget' : 'setup');
  const [notice, setNotice] = useState(boot.notice);
  const [progressOpen, setProgressOpen] = useState(false);
  const [grabbed, setGrabbed] = useState<Plan | null>(null);
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const dismissToast = useCallback(() => dispatch({ type: 'dismissToast' }), [dispatch]);
  const plan = state.plan;

  useEffect(() => {
    if (!grabbed) return;
    const release = () => setGrabbed(null);
    document.addEventListener('pointerup', release);
    document.addEventListener('pointercancel', release);
    return () => {
      document.removeEventListener('pointerup', release);
      document.removeEventListener('pointercancel', release);
    };
  }, [grabbed]);

  const focusTitleNext = useRef(false);
  useEffect(() => {
    if (!focusTitleNext.current || !plan) return;
    focusTitleNext.current = false;
    document.getElementById('plan-title')?.focus();
  }, [plan]);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    const index = TABS.findIndex((t) => t.id === tab);
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault();
    const target = TABS[next];
    if (target) {
      setTab(target.id);
      refs.current[target.id]?.focus();
    }
  }

  const needPlan = (
    <EmptyState
      title="Create your plan first and this section comes alive."
      action="Go to Plan setup"
      onAction={() => setTab('setup')}
    />
  );

  return (
    <div className="min-h-screen text-ink md:flex relative overflow-x-hidden">
      {/* Liquid Glass Ambient Aurora Mesh */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-[10vw] -left-[10vw] w-[50vw] h-[50vw] min-w-[360px] min-h-[360px] rounded-full bg-gradient-to-br from-violet-600/30 via-indigo-500/22 to-transparent blur-[100px] transform-gpu" />
        <div className="absolute top-[20vh] -right-[12vw] w-[46vw] h-[46vw] min-w-[340px] min-h-[340px] rounded-full bg-gradient-to-bl from-teal-400/25 via-sky-500/25 to-transparent blur-[95px] transform-gpu" />
        <div className="absolute -bottom-[10vh] left-[20vw] w-[48vw] h-[48vw] min-w-[350px] min-h-[350px] rounded-full bg-gradient-to-tr from-pink-500/20 via-purple-500/18 to-amber-300/15 blur-[105px] transform-gpu" />
      </div>
      <a
        href="#main"
        className="sr-only-focusable no-print fixed left-3 top-3 z-50 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-on-accent shadow-elevated"
      >
        Skip to main content
      </a>
      <Header
        plan={plan}
        tab={tab}
        onTabChange={setTab}
        onReset={() => {
          dispatch({ type: 'reset' });
          setTab('setup');
          if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
        }}
        tabs={TABS}
        refs={refs}
        onKeyDown={onKeyDown}
      />

      <div className="flex-1 min-w-0">
        <main
          id="main"
          className="no-print mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8"
          onPointerDownCapture={(event) => {
            if (plan && event.target instanceof HTMLInputElement && event.target.type === 'range') {
              setGrabbed(plan);
            }
          }}
        >
          {notice && (
            <div
              role="status"
              className={`mb-6 flex items-start justify-between gap-3 rounded-2xl border p-4 text-sm shadow-sm ${
                notice.kind === 'bad_link' ? 'border-warn/40 bg-warn-soft text-warn' : 'border-line bg-accent-soft text-ink'
              }`}
            >
              <p className="flex items-center gap-2 font-medium">
                {notice.kind === 'bad_link' && <Icon name="alert" className="h-4 w-4 shrink-0 text-warn" />}
                <span>{notice.message}</span>
              </p>
              <button type="button" className="btn-quiet min-h-8 shrink-0 text-xs font-semibold" onClick={() => setNotice(null)}>
                Dismiss
              </button>
            </div>
          )}

          {plan && <PlanMasthead plan={plan} today={today} />}
          {plan && <AssistantPanel plan={grabbed ?? plan} today={today} onNavigate={setTab} />}

          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
            className="panel-enter outline-none"
            key={tab}
          >
            {tab === 'setup' && (
              <div className="space-y-6">
                <PlanSetup
                  key={plan ? 'existing' : 'new'}
                  today={today}
                  existing={plan}
                  onCreate={(created) => {
                    focusTitleNext.current = true;
                    dispatch({ type: 'create', plan: created });
                    setTab('budget');
                  }}
                />
                {plan && (
                  <Suspense fallback={<p role="status">Loading ideas…</p>}>
                    <IdeasPanel plan={plan} />
                  </Suspense>
                )}
              </div>
            )}
            {tab === 'budget' && (plan ? <BudgetTab plan={plan} dispatch={dispatch} /> : needPlan)}
            {tab === 'timeline' &&
              (plan ? <TimelineTab plan={plan} today={today} dispatch={dispatch} /> : needPlan)}
            {tab === 'vendors' &&
              (plan ? (
                <Suspense fallback={<p role="status">Loading vendors…</p>}>
                  <VendorsTab plan={plan} dispatch={dispatch} />
                </Suspense>
              ) : (
                needPlan
              ))}
          </div>
        </main>
      </div>

      {plan && (
        <ProgressPanel
          plan={plan}
          open={progressOpen}
          onToggle={() => setProgressOpen((v) => !v)}
          onNavigate={(next) => {
            setTab(next);
            setProgressOpen(false);
          }}
        />
      )}
      {plan && <PrintSummary plan={plan} today={today} />}
      <Toast toast={state.toast} occasion={plan?.occasion ?? 'wedding'} onDismiss={dismissToast} />
    </div>
  );
}
