import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

interface ServiceIndexProps {
  services: Array<{
    num: string;
    label: string;
    tag: string;
    to: string;
    params?: Record<string, string>;
  }>;
}

export function ServiceIndex({ services }: ServiceIndexProps) {
  return (
    <div>
      {services.map((service) => {
        const inner = (
          <>
            <div className="flex items-baseline gap-5 min-w-0">
              <span className="arch-label flex-shrink-0" style={{ color: "var(--text-secondary)", minWidth: "1.8rem" }}>
                {service.num}
              </span>
              <div>
                <span className="font-display text-[clamp(1.4rem,2.5vw,2rem)] font-light text-ink leading-none group-hover:text-indigo transition-colors duration-200">
                  {service.label}
                </span>
                <span className="ml-4 arch-label" style={{ color: "var(--text-secondary)" }}>
                  {service.tag}
                </span>
              </div>
            </div>
            <ArrowRight
              className="arch-service-row__arrow h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
          </>
        );

        return service.params ? (
          <Link
            key={service.num}
            to={service.to as "/services/$slug"}
            params={service.params as { slug: string }}
            className="arch-service-row group"
            style={{ textDecoration: "none" }}
          >
            {inner}
          </Link>
        ) : (
          <Link
            key={service.num}
            to={service.to as "/walkthrough" | "/construction" | "/services"}
            className="arch-service-row group"
            style={{ textDecoration: "none" }}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
