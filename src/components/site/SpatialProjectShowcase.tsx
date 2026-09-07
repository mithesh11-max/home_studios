import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { SpatialProjectCard, type ProjectItem } from "./SpatialProjectCard";

import walkthroughStudioImg from "@/assets/walkthrough-studio.jpg";
import architectureSiteImg from "@/assets/architecture-site.jpg";
import aboutStudioBannerImg from "@/assets/about-studio-banner.jpg";
import walkthroughArImg from "@/assets/walkthrough-ar.jpg";
import homeStudiosHeroImg from "@/assets/home-studios-hero.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

export const FEATURED_PROJECTS: ProjectItem[] = [
  {
    id: "proj-walkthrough",
    num: "01",
    indexLabel: "01 / 06",
    title: "1:1 Scale Walkthrough",
    category: "VISUALIZATION",
    description: "Commercial laser projection casting your exact floor plan onto the studio floor with full-size furniture on wheels.",
    image: walkthroughStudioImg,
    to: "/walkthrough",
    meta: {
      scale: "1:1 TRUE SCALE",
      location: "RR NAGAR STUDIO",
      tag: "PROJECTION & LASER",
    },
  },
  {
    id: "proj-construction",
    num: "02",
    indexLabel: "02 / 06",
    title: "Construction & Site Execution",
    category: "BUILD",
    description: "Five transparent packages with detailed specifications in writing and a named engineering team on site.",
    image: architectureSiteImg,
    to: "/construction",
    meta: {
      scale: "FULL EXECUTION",
      location: "BENGALURU SITES",
      tag: "5 PACKAGES",
    },
  },
  {
    id: "proj-structural",
    num: "03",
    indexLabel: "03 / 06",
    title: "Structural Engineering",
    category: "ENGINEERING",
    description: "Complete drawings from excavation layout to plinth beams and reinforcement schedules for contractor compliance.",
    image: aboutStudioBannerImg,
    to: "/services/$slug",
    params: { slug: "structural-design" },
    meta: {
      scale: "ENGINEERED RCC",
      location: "SLIDING SCALE",
      tag: "EXCAVATION TO SLAB",
    },
  },
  {
    id: "proj-spatial-ar",
    num: "04",
    indexLabel: "04 / 06",
    title: "3D Spatial Simulation",
    category: "SIMULATION",
    description: "iPad-based AR overlay and immersive 1:1 VR walkthrough testing ceiling height, sightlines, and room atmosphere.",
    image: walkthroughArImg,
    to: "/walkthrough",
    meta: {
      scale: "AR & VR OVERLAY",
      location: "STUDIO LAB",
      tag: "IMMERSIVE SIGHTLINES",
    },
  },
  {
    id: "proj-architecture",
    num: "05",
    indexLabel: "05 / 06",
    title: "Architecture & Layout Design",
    category: "DESIGN",
    description: "Site-specific floor plans shaped around natural light, cross-ventilation, circulation and vaastu alignment.",
    image: homeStudiosHeroImg,
    to: "/services/$slug",
    params: { slug: "architecture-design" },
    meta: {
      scale: "PLOT OPTIMIZED",
      location: "BESPOKE HOMES",
      tag: "LIGHT & ENVELOPE",
    },
  },
  {
    id: "proj-interior",
    num: "06",
    indexLabel: "06 / 06",
    title: "Interior Architecture",
    category: "INTERIOR",
    description: "Kitchen islands, wardrobes and joinery tested at 1:1 scale before expensive material procurement and fabrication.",
    image: interiorFinishedImg,
    to: "/services/$slug",
    params: { slug: "interior-design" },
    meta: {
      scale: "1:1 FIT-OUT",
      location: "LIVING & KITCHEN",
      tag: "JOINERY & FINISHES",
    },
  },
];

interface SpatialProjectShowcaseProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  showAllLink?: boolean;
}

export function SpatialProjectShowcase({
  eyebrow = "06 / PORTFOLIO & SERVICES",
  title = "Spatial projects. Verified before built.",
  description = "Explore our six integrated disciplines. Experience each project with depth, true scale, and precision execution.",
  showAllLink = true,
}: SpatialProjectShowcaseProps) {
  const [navigatingId, setNavigatingId] = useState<string | null>(null);
  const router = useRouter();

  const handleSelect = (project: ProjectItem) => {
    if (navigatingId) return;
    setNavigatingId(project.id);

    // Smooth architectural transition into the project
    setTimeout(() => {
      if (project.params?.slug) {
        router.navigate({
          to: "/services/$slug",
          params: { slug: project.params.slug },
        });
      } else {
        router.navigate({ to: project.to as any });
      }
    }, 260);
  };

  return (
    <section className="py-14 lg:py-20 bg-paper" aria-label="Projects and services portfolio">
      <div className="arch-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-10 sm:mb-12">
          <div>
            <p className="arch-label arch-label--accent mb-3">{eyebrow}</p>
            <h2
              className="font-display text-ink leading-none mb-3"
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              {title}
            </h2>
            <p className="text-stone text-[0.92rem] leading-relaxed max-w-[48ch]">
              {description}
            </p>
          </div>

          {showAllLink && (
            <Link
              to="/services"
              className="arch-btn arch-btn--outline flex-shrink-0 self-end lg:self-auto"
            >
              ALL SERVICES & WORK <span className="arch-btn-arrow">→</span>
            </Link>
          )}
        </div>

        {/* Spatial Project Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FEATURED_PROJECTS.map((project, index) => (
            <SpatialProjectCard
              key={project.id}
              project={project}
              index={index}
              isDimmed={navigatingId !== null && navigatingId !== project.id}
              isSelected={navigatingId === project.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SpatialProjectShowcase;
