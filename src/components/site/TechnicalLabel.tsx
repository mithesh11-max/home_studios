interface TechnicalLabelProps {
  children: React.ReactNode;
  accent?: boolean;
  light?: boolean;
  className?: string;
}

export function TechnicalLabel({ children, accent, light, className = "" }: TechnicalLabelProps) {
  return (
    <span
      className={`arch-label ${accent ? "arch-label--accent" : ""} ${light ? "arch-label--light" : ""} ${className}`}
    >
      {children}
    </span>
  );
}

export function Rule({ className = "" }: { className?: string }) {
  return <div className={`arch-rule ${className}`} aria-hidden="true" />;
}
