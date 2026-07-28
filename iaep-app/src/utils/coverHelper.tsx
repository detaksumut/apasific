import React from 'react';

/**
 * Renders a clean, beautifully styled cover title overlay.
 * - Strips SINTA prefix ([SINTA_1], etc.) from the title to keep it professional.
 * - Uses modern font-sans and white color (#ffffff) for the title.
 * - Dynamically scales font sizes based on title length to prevent overflow.
 * - Splits colons into bold main titles and clean subtitles.
 * 
 * @param title The manuscript title string
 * @param scaleFactor Multiplier for font size adjustments (default 1.0)
 */
export function renderCoverTitle(title: string, scaleFactor: number = 1.0) {
  if (!title) return null;
  
  // Clean SINTA prefix (e.g. [SINTA_1] or [SINTA 1])
  const cleanedTitle = title.replace(/^\[SINTA_\d+\]\s*/i, '')
                            .replace(/^\[SINTA\s+\d+\]\s*/i, '')
                            .trim();
  const len = cleanedTitle.length;
  
  // Base font size classes/styles in px (stable, doesn't break with viewport size)
  let fontSize = 11 * scaleFactor;
  let lineHeight = 1.25;
  
  if (len > 120) {
    fontSize = 9.5 * scaleFactor;
    lineHeight = 1.2;
  } else if (len > 70) {
    fontSize = 11.5 * scaleFactor;
    lineHeight = 1.2;
  } else {
    fontSize = 14 * scaleFactor;
    lineHeight = 1.3;
  }
  
  const hasColon = cleanedTitle.includes(':');
  if (hasColon) {
    const parts = cleanedTitle.split(':');
    const mainTitle = parts[0].trim();
    const subTitle = parts.slice(1).join(':').trim();
    
    return (
      <div className="font-sans text-left tracking-wide text-white" style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}` }}>
        <div className="font-extrabold uppercase mb-0.5 drop-shadow-sm">
          {mainTitle}:
        </div>
        <div className="font-semibold text-zinc-200 drop-shadow-sm">
          {subTitle}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="font-sans font-extrabold uppercase text-left tracking-wide text-white drop-shadow-md" 
      style={{ fontSize: `${fontSize}px`, lineHeight: `${lineHeight}` }}
    >
      {cleanedTitle}
    </div>
  );
}
