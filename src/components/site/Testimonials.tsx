/**
 * Testimonials section — reserved for genuine quotes when supplied.
 * Not rendered until real reviews are provided.
 * 
 * To add testimonials, pass items as props:
 *   interface TestimonialItem { quote: string; author: string; location?: string; }
 */
export function Testimonials({ items }: { items: unknown[] }) {
  // Per design spec: do not display testimonials section until genuine quotes are supplied.
  // This component is retained for easy future extension.
  if (!items || items.length === 0) return null;
  return null;
}
