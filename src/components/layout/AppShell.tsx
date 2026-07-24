import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Tab {
  to: string
  label: string
  icon: (active: boolean) => ReactNode
}

const TABS: Tab[] = [
  {
    to: '/home',
    label: 'Home',
    icon: (active) => (
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3a1 1 0 0 0 1-1v-9"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/meals',
    label: 'Meals',
    icon: (active) => (
      <path
        d="M7 3v7a2 2 0 1 0 4 0V3M9 10v11M17 3c-1.7 0-3 2.2-3 5s1.3 5 3 5v8"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/dashboard',
    label: 'Progress',
    icon: (active) => (
      <path
        d="M5 20V10M12 20V4M19 20v-7"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    to: '/roadmap',
    label: 'Roadmap',
    icon: (active) => (
      <path
        d="M4 20c3-6 4-13 4-16m4 16c1-5 1.5-10 1-16m3 16c1.5-4 3.5-9 5-13"
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-dvh">
      {/* Desktop/tablet: fixed left sidebar. Hidden below md, where the bottom
          tab bar takes over — two presentations of the same nav, not two
          separate navigation systems. */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-bg-elevated/60 px-4 py-8 md:flex">
        <p className="px-3 font-display text-display-sm tracking-wide text-fg">FitCoach</p>
        <nav aria-label="Primary" className="mt-8 flex flex-col gap-1">
          {TABS.map((tab) => {
            const active = location.pathname.startsWith(tab.to)
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm"
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill-desktop"
                    className="absolute inset-0 rounded-lg bg-accent-muted"
                    transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <svg
                  viewBox="0 0 24 24"
                  width={20}
                  height={20}
                  className={cn('relative', active ? 'text-accent' : 'text-fg-subtle')}
                  aria-hidden
                >
                  {tab.icon(active)}
                </svg>
                <span className={cn('relative', active ? 'font-medium text-fg' : 'text-fg-muted')}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <div className="pb-24 md:pb-0 md:pl-60">{children}</div>

      {/* Mobile: bottom tab bar. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg-elevated/90 backdrop-blur-lg md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {TABS.map((tab) => {
            const active = location.pathname.startsWith(tab.to)
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={active ? 'page' : undefined}
                className="relative flex flex-1 flex-col items-center gap-1 px-2 py-2.5 text-xs"
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-x-3 top-1 h-8 rounded-full bg-accent-muted"
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { type: 'spring', stiffness: 380, damping: 30 }
                    }
                  />
                )}
                <svg
                  viewBox="0 0 24 24"
                  width={22}
                  height={22}
                  className={cn('relative', active ? 'text-accent' : 'text-fg-subtle')}
                  aria-hidden
                >
                  {tab.icon(active)}
                </svg>
                <span className={cn('relative', active ? 'font-medium text-fg' : 'text-fg-subtle')}>
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
