import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { DURATION, EASE_ARCH_SMOOTH } from "@/lib/motion";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  defaultOpen?: string | undefined;
}

export function FAQ({ items, defaultOpen }: FAQProps) {
  const [open, setOpen] = useState<string | undefined>(defaultOpen);

  return (
    <div aria-label="Frequently asked questions">
      {items.map((item, i) => {
        const isOpen = open === item.question;
        const panelId = `faq-panel-${i}`;
        const triggerId = `faq-trigger-${i}`;
        return (
          <div key={item.question} style={{ borderBottom: "1px solid var(--border)" }}>
            <button
              id={triggerId}
              className="arch-faq-trigger"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? undefined : item.question)}
            >
              <span className="flex items-baseline gap-4">
                <span className="arch-label flex-shrink-0" style={{ color: isOpen ? "var(--indigo)" : "var(--text-secondary)", minWidth: "1.5rem" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ color: isOpen ? "var(--indigo)" : "var(--text-primary)", transition: "color 0.18s ease" }}>
                  {item.question}
                </span>
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: DURATION.TABS, ease: EASE_ARCH_SMOOTH }}
                className="flex-shrink-0"
                style={{ color: isOpen ? "var(--indigo)" : "var(--text-secondary)" }}
                aria-hidden="true"
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: DURATION.STANDARD, ease: EASE_ARCH_SMOOTH }}
                  style={{ overflow: "hidden" }}
                  aria-hidden={!isOpen}
                >
                  <p className="pb-6 pl-9 text-[0.93rem] leading-relaxed max-w-[60ch]" style={{ color: "var(--text-secondary)" }}>
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
