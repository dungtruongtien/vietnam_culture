'use client';

import AdSlot from './AdSlot';

// Fixed left/right sidebar ads. Only rendered when the viewport is wide enough
// to have 160px of space on each side beyond the max-w-7xl (1280px) content.
// We need at least 1280 + 2*(160+16) = 1632px → show at 2xl (1536px).
export default function SideAds() {
  return (
    <>
      {/* Left column */}
      <div
        className="hidden 2xl:flex fixed top-1/2 -translate-y-1/2 flex-col gap-4 items-center"
        style={{ left: 'max(8px, calc(50% - 640px - 176px))', zIndex: 40 }}
        aria-hidden="true"
      >
        <AdSlot id="side-left-top" size="skyscraper" />
      </div>

      {/* Right column */}
      <div
        className="hidden 2xl:flex fixed top-1/2 -translate-y-1/2 flex-col gap-4 items-center"
        style={{ right: 'max(8px, calc(50% - 640px - 176px))', zIndex: 40 }}
        aria-hidden="true"
      >
        <AdSlot id="side-right-top" size="skyscraper" />
      </div>
    </>
  );
}
