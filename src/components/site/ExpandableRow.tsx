import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

interface ExpandableRowProps {
  num: string;
  title: string;
  description: string;
}

export function ExpandableRow({ num, title, description }: ExpandableRowProps) {
  const [open, setOpen] = useState(false);
  const contentId = `expandable-${num.replace(/\s/g, "-")}`;

  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center gap-5 py-5 text-left group"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <span
          className="arch-label flex-shrink-0"
          style={{ minWidth: "1.5rem", color: open ? "var(--indigo)" : "var(--text-secondary)" }}
        >
          {num}
        </span>
        <span
          className="font-display text-[clamp(1.2rem,2vw,1.6rem)] font-light flex-1"
          style={{
            color: open ? "var(--indigo)" : "var(--text-primary)",
            transition: "color 0.18s ease",
          }}
        >
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex-shrink-0"
          style={{ color: open ? "var(--indigo)" : "var(--text-secondary)" }}
          aria-hidden="true"
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
            aria-hidden={!open}
          >
            <p className="pb-5 pl-9 text-[0.93rem] leading-relaxed max-w-[52ch]" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
