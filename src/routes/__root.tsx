import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext } from "@tanstack/react-router";
import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { AppointmentProvider } from "@/lib/appointment-context";
import { AppointmentDialog } from "@/components/site/AppointmentDialog";
import { TileGridBackground } from "@/components/site/TileGridBackground";
import { RouteTransition } from "@/components/site/RouteTransition";
import { SmoothScrollProvider } from "@/lib/lenis-context";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "var(--bg-deep)" }}>
      <p className="arch-label arch-label--accent mb-5">404 — NOT FOUND</p>
      <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-light leading-none mb-6" style={{ color: "var(--text-primary)" }}>
        Page not<br />found.
      </h1>
      <p className="mb-10 max-w-[34ch]" style={{ color: "var(--text-secondary)" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="arch-btn arch-btn--primary"
        data-interactive
      >
        RETURN HOME <span className="arch-btn-arrow">→</span>
      </Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center" style={{ backgroundColor: "var(--bg-deep)" }}>
      <p className="arch-label arch-label--accent mb-5">ERROR</p>
      <h1 className="font-display text-[clamp(2rem,5vw,4rem)] font-light leading-none mb-6" style={{ color: "var(--text-primary)" }}>
        Something<br />went wrong.
      </h1>
      <p className="mb-10 max-w-[34ch]" style={{ color: "var(--text-secondary)" }}>
        This page didn't load correctly. Try refreshing, or head back home.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => { reset(); }}
          className="arch-btn arch-btn--primary"
          data-interactive
        >
          TRY AGAIN
        </button>
        <a href="/" className="arch-btn arch-btn--outline" data-interactive>
          GO HOME <span className="arch-btn-arrow">→</span>
        </a>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <SmoothScrollProvider>
          <AppointmentProvider>
            {/* 3D Tile grid ripple background & cursor shockwave */}
            <TileGridBackground />

            {/* Route content stacked above background */}
            <div className="relative z-[1]">
              <RouteTransition>
                <Outlet />
              </RouteTransition>
            </div>
            <AppointmentDialog />
          </AppointmentProvider>
        </SmoothScrollProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}
