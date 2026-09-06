import type { LucideIcon } from "lucide-react";
import {
  Projector,
  Glasses,
  Scan,
  Sofa,
  Building2,
  Columns3,
  Stamp,
  Compass,
  Ruler,
  Layers,
  ShieldCheck,
  Users,
  FileText,
  Wifi,
  Paintbrush,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export interface NavLink {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Construction", to: "/construction" },
  { label: "Services", to: "/services" },
  { label: "Contact Us", to: "/contact" },
];

export const CONTACT = {
  name: "Home Studios",
  tagline: "Architectural Visualization & Construction",
  phone: "+91 866 082 3337",
  phoneHref: "tel:+918660823337",
  email: "contact@homestudios.co.in",
  emailHref: "mailto:contact@homestudios.co.in",
  whatsappHref:
    "https://wa.me/918660823337?text=Hi%20Home%20Studios%2C%20I%27d%20like%20to%20book%20a%203D%20walkthrough%20slot.",
  addressLines: [
    "18th Main, Sapthagiri Layout, Chansandra",
    "Rajarajeshwari Nagar, Bengaluru",
    "Karnataka 560098",
  ],
  hours: "Monday – Saturday: 9:00 AM – 7:00 PM IST",
  mapEmbedSrc:
    "https://www.google.com/maps?q=18th+Main,+Sapthagiri+Layout,+Chansandra,+Rajarajeshwari+Nagar,+Bengaluru,+Karnataka+560098&output=embed",
};

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const STATS: Stat[] = [
  { value: 289, suffix: "+", label: "Delivered units" },
  { value: 789, suffix: "+", label: "Structural designs" },
  { value: 549, suffix: "+", label: "Plan approvals" },
  { value: 3000, suffix: "+", label: "Walkthroughs completed" },
  { value: 100, suffix: "+", label: "Five-star Google reviews" },
  { value: 40, suffix: "+", label: "Team members" },
];

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export type ServiceSlug =
  | "3d-walkthrough"
  | "structural-design"
  | "plans-approval"
  | "architecture-design"
  | "interior-design";

export interface ServiceStep {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceDetail {
  slug: ServiceSlug;
  name: string;
  icon: LucideIcon;
  cardSummary: string;
  heroLede: string;
  overview: string[];
  highlights: string[];
  steps: ServiceStep[];
  pricingNote: string;
  faqs: ServiceFaq[];
}

export const SERVICES: ServiceDetail[] = [
  {
    slug: "3d-walkthrough",
    name: "3D Walk Through",
    icon: Projector,
    cardSummary:
      "Walk your floor plan at real, 1:1 scale using laser projection, AR and VR, with real furniture on wheels.",
    heroLede:
      "A 3D walkthrough replaces the guesswork of reading a printed plan with the certainty of walking the actual rooms, at actual size, with actual furniture.",
    overview: [
      "A floor plan drawn to a 1:100 scale on paper looks nothing like a room once you're standing inside it. Our studio uses commercial-grade laser projectors to cast your exact floor plan onto the floor at true, full size — every wall, doorway and dimension exactly where it will sit on site.",
      "We then bring in real, wheeled furniture — sofas, beds, wardrobes, kitchen counters — and place it inside the projected outline, so you can physically walk the space, open a wardrobe door, or check if two people can pass each other in a corridor.",
    ],
    highlights: [
      "Real furniture placed in the room for true understanding of size and scale",
      "Test more than one layout in the same session to find the one that works",
      "Over 40 prop walls in different sizes, moved live as you request changes",
      "Wireless technology and furniture on wheels for quick, damage-free changes",
      "A kid-friendly waiting area with Netflix, Disney+, Stan and free WiFi for families",
    ],
    steps: [
      { title: "Schedule an appointment", description: "Call, WhatsApp or write in and tell us about your project." },
      { title: "Send your floor plan & book a slot", description: "Share your plan and reserve a time slot at the studio." },
      { title: "We prepare your session", description: "Projection, props and furniture are set up to match your plan." },
      { title: "Walk through & make changes", description: "Walk every room at true size and leave with a plan you trust." },
    ],
    pricingNote:
      "Session length and pricing depend on the size and complexity of the plan you bring — get in touch and we'll confirm both for your project.",
    faqs: [
      {
        question: "Do I need a completed floor plan to book a session?",
        answer:
          "It helps to have one, even in draft form. If you don't have a plan yet, our architecture design team can prepare one with you ahead of your walkthrough.",
      },
      {
        question: "Can I test more than one layout in a single visit?",
        answer:
          "Yes. Our prop walls and furniture are on wheels specifically so we can reconfigure the room and compare alternative layouts in the same session.",
      },
      {
        question: "Is the studio suitable for young children?",
        answer:
          "Yes — we keep a family-friendly waiting area with Netflix, Disney+, Stan and free WiFi so parents can focus on the walkthrough.",
      },
    ],
  },
  {
    slug: "structural-design",
    name: "Structural Design",
    icon: Columns3,
    cardSummary:
      "Excavation, column, footing and plinth beam layouts plus reinforcement schedules — priced on a sliding per-sq.ft scale.",
    heroLede:
      "Complete structural drawings — from excavation to reinforcement schedules — priced per sq.ft on a sliding scale, so larger projects cost less per square foot to engineer.",
    overview: [
      "An architectural plan tells you where walls go. Structural design tells you they'll stay up. Skipping or under-engineering structural design is one of the most expensive mistakes a self-managed build can make — undersized footings, misplaced columns or missing reinforcement schedules lead to cracks, settlement issues, or contractors improvising on site with no drawing to follow.",
      "Our structural team works directly against your architectural plan, so column positions, beam depths and footing sizes are resolved before excavation begins — not renegotiated mid-build.",
    ],
    highlights: [
      "Excavation layout — precise dig lines and depths matched to soil and site conditions",
      "Column working layout — exact column positions and sizes",
      "Footing layout — sized and placed to carry the full structural load",
      "Plinth beam layout, reinforcement schedules and UG sump details",
    ],
    steps: [
      { title: "Share your architectural plan", description: "We review your approved layout and site conditions." },
      { title: "Structural analysis", description: "Loads, spans and soil conditions are worked into the design." },
      { title: "Drawings issued", description: "Excavation, column, footing, plinth beam and reinforcement drawings delivered." },
      { title: "Site support", description: "Our team is available to clarify drawings during construction." },
    ],
    pricingNote:
      "Pricing depends on your built-up area and site conditions — contact us for a quote specific to your project.",
    faqs: [
      {
        question: "Do I need structural design if I'm building a small house?",
        answer:
          "Yes — building size doesn't remove the need for engineered footings, columns and reinforcement. Our smallest tier (500–2,000 sq.ft) is priced specifically for independent homes and small villas.",
      },
      {
        question: "Can structural design happen alongside architecture design?",
        answer:
          "Yes, and we recommend it — resolving structure and architecture together avoids column clashes with your layout later.",
      },
      {
        question: "What is a peer review and do I need one?",
        answer:
          "A peer review is an independent check of structural drawings prepared by another consultant, useful as a second opinion before construction begins on a large or complex project.",
      },
    ],
  },
  {
    slug: "plans-approval",
    name: "Plans Approval",
    icon: Stamp,
    cardSummary:
      "We handle the documentation and coordination needed to get your building plan cleared by the municipal authority.",
    heroLede:
      "We prepare and coordinate the documentation your building plan needs to clear municipal and regulatory approval in Bengaluru — so excavation isn't held up by paperwork.",
    overview: [
      "Getting a building plan approved in Bengaluru means satisfying the local municipal authority's building bye-laws — setbacks, floor area ratio, parking provisions and structural compliance among them. We prepare the plan set and supporting documents, submit them, and follow up with the authority on your behalf.",
      "Projects within Bengaluru are typically approved through the Bruhat Bengaluru Mahanagara Palike (BBMP) or the relevant local planning authority for the site. We identify the correct authority for your plot and manage submission accordingly.",
    ],
    highlights: [
      "Building plan drawings prepared to local bye-law requirements",
      "Coordination with the municipal authority through to sanction",
      "Structural design cross-checked against the submitted plan",
      "Status updates so you always know where your application stands",
    ],
    steps: [
      { title: "Site & document review", description: "We confirm eligibility using khata and survey details." },
      { title: "Plan preparation", description: "Drawings prepared to setback, FAR and bye-law requirements." },
      { title: "Submission & follow-up", description: "We submit to the relevant authority and handle queries raised." },
      { title: "Sanctioned plan handover", description: "You receive your approved plan, ready for construction." },
    ],
    pricingNote:
      "Quoted per project based on plot size and site conditions — approval timelines are set by the municipal authority and vary by ward and case load.",
    faqs: [
      {
        question: "Which authority approves plans in Bengaluru?",
        answer:
          "Most projects go through the Bruhat Bengaluru Mahanagara Palike (BBMP) or the relevant local planning authority for the site — we confirm the correct one for your plot.",
      },
      {
        question: "How long does approval take?",
        answer:
          "Timelines are set by the municipal authority and vary by ward, plot type and case load. We give a realistic estimate once we've reviewed your site documents.",
      },
    ],
  },
  {
    slug: "architecture-design",
    name: "Architecture Design",
    icon: Compass,
    cardSummary:
      "Site-specific planning that balances natural light, ventilation, vaastu preferences and how your family actually lives.",
    heroLede:
      "We design layouts that balance your brief, your plot, natural light and ventilation, and vaastu preferences where they matter to you — then test the result in our walkthrough studio.",
    overview: [
      "Most architectural plans are approved based on a 2D drawing alone. At Home Studios, your layout goes further — once a working plan is ready, we project it at true scale in our studio so you can confirm room proportions, circulation and furniture fit before the plan is locked for structural design and approval.",
      "We work with homeowners building from scratch, as well as architects and developers who want a second layer of validation before presenting a plan to their own clients.",
    ],
    highlights: [
      "Plot orientation, natural light and cross-ventilation",
      "Setbacks and floor area ratio applicable to your site",
      "Vaastu preferences, where they matter to your family",
      "Future needs — additional floors, family growth, rental units",
    ],
    steps: [
      { title: "Brief & site study", description: "We understand your requirements, budget and plot conditions." },
      { title: "Concept layout", description: "An initial floor plan is drafted for your review and revisions." },
      { title: "Studio walkthrough", description: "The refined plan is projected at true scale for you to confirm." },
      { title: "Final drawings", description: "Issued and ready for structural design and approval." },
    ],
    pricingNote:
      "Architecture design is quoted against your plot size, brief and level of detail required. Many clients bundle it with structural design and plans approval.",
    faqs: [
      {
        question: "Who is architecture design for?",
        answer:
          "Homeowners designing a new independent home or villa, architects seeking a walkthrough-validated second opinion, and developers planning multi-unit layouts.",
      },
      {
        question: "Can I test the design before it's finalized?",
        answer:
          "Yes — once a working plan is ready we project it at true scale in our studio so you can confirm it in person before it's locked in.",
      },
    ],
  },
  {
    slug: "interior-design",
    name: "Interior Designing",
    icon: Sofa,
    cardSummary:
      "Interior concepts you can test inside the walkthrough studio before a single cabinet or wall is built.",
    heroLede:
      "From layout to material palette, we design interiors and test them at true scale in the studio — so the kitchen island, wardrobe run or TV unit you choose is one you've actually stood next to.",
    overview: [
      "Good interiors solve how a space is used before they decide how it looks. We start with circulation, storage and how each room will actually be lived in, then layer in material, colour and lighting choices that suit your taste and budget.",
      "Because our studio can project furniture layouts at real size, kitchen counters, wardrobe depths and seating arrangements can be checked physically — not just imagined from a rendered image.",
    ],
    highlights: [
      "Space planning for kitchens, wardrobes, living and dining areas",
      "Material, colour and lighting concepts for every room",
      "Real-size walkthrough of key furniture layouts before execution",
      "Coordination with construction for a seamless fit-out",
    ],
    steps: [
      { title: "Style & requirement brief", description: "We discuss how you use each space and your preferences." },
      { title: "Concept & layout", description: "Space plans and mood concepts prepared for your review." },
      { title: "Studio walkthrough", description: "Key layouts tested at real size before materials are finalized." },
      { title: "Execution", description: "Our team coordinates fit-out and installation through to handover." },
    ],
    pricingNote:
      "Timelines depend on the scope of rooms involved and material lead times — we confirm a project-specific schedule once your brief is finalized.",
    faqs: [
      {
        question: "Do you handle full-home interiors or single rooms?",
        answer:
          "Both — from a full-home interior design coordinated alongside construction, to a single kitchen or living room refresh in a home you already own.",
      },
      {
        question: "Can layouts be tested before I commit to materials?",
        answer:
          "Yes — key furniture layouts such as kitchen counters and wardrobe runs can be walked at real size in the studio before you order materials.",
      },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceDetail | undefined {
  return SERVICES.find((service) => service.slug === slug);
}

// ---------------------------------------------------------------------------
// Construction packages
// ---------------------------------------------------------------------------

export interface ConstructionPackage {
  name: string;
  priceLabel: string;
  highlight?: boolean;
}

export const PACKAGES: ConstructionPackage[] = [
  { name: "Basic", priceLabel: "₹1,599" },
  { name: "Deluxe", priceLabel: "₹1,869" },
  { name: "Luxury", priceLabel: "₹1,999", highlight: true },
  { name: "Elite", priceLabel: "₹2,359" },
  { name: "Supreme", priceLabel: "₹2,459" },
];

export interface PackageRow {
  category: string;
  values: [string, string, string, string, string];
}

export const PACKAGE_ROWS: PackageRow[] = [
  {
    category: "Structure",
    values: [
      "Standard RCC frame to structural design",
      "Standard RCC frame, reinforced spec",
      "Enhanced RCC frame & detailing",
      "Enhanced RCC frame, premium detailing",
      "Premium RCC frame, full custom detailing",
    ],
  },
  {
    category: "Kitchen",
    values: [
      "Standard counter & basic fittings",
      "Upgraded counter & fittings",
      "Modular-ready counter, branded fittings",
      "Modular kitchen shell, premium fittings",
      "Full modular kitchen, designer-grade fittings",
    ],
  },
  {
    category: "Washroom",
    values: [
      "Standard sanitaryware & CP fittings",
      "Upgraded sanitaryware",
      "Branded sanitaryware & fittings",
      "Premium branded sanitaryware",
      "Designer sanitaryware & fittings",
    ],
  },
  {
    category: "Doors & windows",
    values: [
      "Standard flush doors, UPVC/aluminium windows",
      "Upgraded doors, UPVC windows",
      "Designer main door, UPVC windows",
      "Premium designer doors & windows",
      "Custom designer doors & premium glazing",
    ],
  },
  {
    category: "Electrical",
    values: [
      "Standard wiring & switches",
      "Upgraded switches & points",
      "Branded modular switches",
      "Premium modular switches, extra points",
      "Home-automation-ready wiring & premium switches",
    ],
  },
  {
    category: "Flooring",
    values: [
      "Standard vitrified tiles",
      "Upgraded vitrified tiles",
      "Premium vitrified / branded tiles",
      "Large-format premium tiles",
      "Designer flooring, premium large-format tiles",
    ],
  },
  {
    category: "Painting",
    values: [
      "Standard emulsion, interior & exterior",
      "Premium emulsion",
      "Premium emulsion with texture accents",
      "Designer texture & premium emulsion",
      "Full designer finish, premium exterior coating",
    ],
  },
  {
    category: "Amenities",
    values: [
      "Essential fit-outs only",
      "Essential fit-outs, upgraded finish",
      "Additional fit-outs & storage",
      "Extended amenities package",
      "Full amenities & premium fit-out package",
    ],
  },
];

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export interface Testimonial {
  quote: string;
  name: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Allowed us to perfect the floorplans early and reduced the client's risks in construction, plus saved us design time.",
    name: "Google review",
    initials: "GR",
  },
  {
    quote:
      "Deep insight into the construction field — planning, material purchasing, structural work. Right information shared with the customer, with regular site visits to track progress. Overall a must-visit place for constructing buildings.",
    name: "Vinay Kumar Kumar",
    initials: "VK",
  },
  {
    quote:
      "Valuable, informative opinions shared regarding the construction field. Very good, timely response. Must visit before planning your dream project.",
    name: "Saathvik V",
    initials: "SV",
  },
  {
    quote:
      "Friendly, very good planning, best price, good quality of work — even helped me get bath fittings at a reasonable rate from well-known dealers. Quick response any time. One of the best construction companies in Karnataka.",
    name: "Madhu Kiran",
    initials: "MK",
  },
  {
    quote:
      "This service isn't an expense — it's an investment. Our session at Home Studios was the best decision we've made, saving us from costly changes and design regrets. By far the best ROI in our entire project so far.",
    name: "Tayla Cuffe",
    initials: "TC",
  },
  {
    quote: "Nice place. Thanks for the valuable feedback and support.",
    name: "Raghavendra Jadhav",
    initials: "RJ",
  },
];

// ---------------------------------------------------------------------------
// Home page FAQ
// ---------------------------------------------------------------------------

export const HOME_FAQS: ServiceFaq[] = [
  {
    question: "What actually happens in a walkthrough session?",
    answer:
      "We load your floor plan and project it onto our studio floor at true 1:1 scale, then bring in real, wheeled furniture so you can walk every room, doorway and corner exactly as it will be built. AR and VR options let you also see finished walls, ceilings and finishes.",
  },
  {
    question: "Do I need to already have a floor plan?",
    answer:
      "No. If you already have one from your architect, send it ahead of your slot. If you don't, our architecture design and structural design teams can prepare one with you before your session.",
  },
  {
    question: "Is this useful if construction has already started?",
    answer:
      "Yes, though the biggest savings come from visiting before excavation begins. A walkthrough at the plinth or structural stage can still catch layout issues in kitchens, bathrooms and room sizes before finishing work locks them in.",
  },
  {
    question: "Who is this for besides homeowners?",
    answer:
      "Architects, interior and landscape designers, residential and commercial developers, and institutions such as hospitals and hotels all use our studio to validate layouts with their own clients before committing budgets.",
  },
  {
    question: "Do you work outside Bengaluru?",
    answer:
      "Our studio and construction operations are based in Rajarajeshwari Nagar, Bengaluru. Get in touch with your project location and we'll let you know how we can help.",
  },
  {
    question: "How much does a session or a project cost?",
    answer:
      "Pricing depends on your plan size, scope, and specific requirements — contact us for a quote tailored to your project.",
  },
];

// ---------------------------------------------------------------------------
// Values / why choose us
// ---------------------------------------------------------------------------

export const VALUES = [
  {
    icon: Ruler,
    title: "Accuracy over guesswork",
    description:
      "Real-size projection and precise structural drawings replace assumptions with something you can measure.",
  },
  {
    icon: FileText,
    title: "Transparent specifications",
    description:
      "Every construction package and design service comes with clear, detailed specifications in writing.",
  },
  {
    icon: ShieldCheck,
    title: "Accountable delivery",
    description:
      "Regular site visits and a named team on every project — no disappearing after the contract is signed.",
  },
  {
    icon: Users,
    title: "Client-first advice",
    description: "We tell clients what we'd choose for our own home — even when it's the simpler, cheaper option.",
  },
];

export const WALKTHROUGH_MODES = [
  {
    icon: Projector,
    title: "Laser projection",
    description: "Commercial-grade laser projectors cast your plan at true 1:1 scale on the floor.",
  },
  {
    icon: Glasses,
    title: "Augmented reality",
    description: "iPad-based AR overlays walls, cabinets and fittings onto the live room.",
  },
  {
    icon: Scan,
    title: "Virtual reality",
    description: "Step inside a fully finished, to-scale render of your future home.",
  },
  {
    icon: Sofa,
    title: "Real furniture",
    description: "Wheeled, full-size furniture drops straight into the projected layout.",
  },
];

export const TEAM_DISCIPLINES = [
  { icon: Compass, title: "Architecture & design", description: "Shaping layouts around how you'll actually live." },
  { icon: Columns3, title: "Structural engineering", description: "Footing, column and reinforcement drawings your contractor can build from." },
  { icon: Stamp, title: "Approvals & documentation", description: "Managing plan submissions and municipal clearance paperwork." },
  { icon: Building2, title: "Site & construction", description: "Project managers and site supervisors who visit regularly and report progress." },
];

export const INTERIOR_AUDIENCE = [
  { icon: Building2, title: "New homes", description: "Full-home interior design coordinated alongside your construction package." },
  { icon: Paintbrush, title: "Renovations", description: "Refresh kitchens, wardrobes and living spaces in a home you already own." },
  { icon: Sofa, title: "Commercial spaces", description: "Interior concepts for offices, clinics and hospitality spaces at any scale." },
];

export const WALKTHROUGH_INCLUDED = [
  { icon: Layers, title: "40+ prop walls", description: "Movable walls in different sizes to test alternate layouts live." },
  { icon: Ruler, title: "Real furniture", description: "Full-size, wheeled pieces you can move into place yourself." },
  { icon: Users, title: "Team guidance", description: "A Home Studios specialist walks the session with you throughout." },
  { icon: Wifi, title: "Family-friendly wait area", description: "Netflix, Disney+, Stan and free WiFi for anyone waiting with you." },
];
