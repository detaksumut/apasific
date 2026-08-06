import React from "react";

export interface DynamicCoverProps {
  title: string;
  journalCode?: string;
  volume?: string;
  issue?: string;
  doi?: string;
  createdAt?: string;
  publishedAt?: string | null;
  coverUrl?: string | null;
  maxLines?: number;
  variant?: "full" | "thumbnail" | "preview";
  className?: string;
}

export default function DynamicCover({
  title,
  journalCode = "",
  volume = "",
  issue = "",
  doi = "",
  createdAt = "",
  publishedAt = null,
  coverUrl,
  maxLines = 8,
  variant = "full",
  className = "",
}: DynamicCoverProps) {
  // Determine fallback image based on journalCode if coverUrl is missing
  const getFallbackCover = () => {
    if (journalCode.toUpperCase().includes("AJAF")) return "/coverAJAF.png";
    if (journalCode.toUpperCase().includes("AJITE")) return "/coverAJITE.png";
    return "/coverPKM.png";
  };

  const finalCoverUrl = coverUrl || getFallbackCover();

  // Parsing Subtitle
  const parseTitleSubtitle = (rawTitle: string) => {
    if (!rawTitle) return { main: "", sub: "" };

    // Prioritas 1: Kurung ()
    const matchParenthesis = rawTitle.match(/^(.*?)\s*\((.*?)\)\s*$/);
    if (matchParenthesis) {
      return {
        main: matchParenthesis[1].trim(),
        sub: `(${matchParenthesis[2].trim()})`,
      };
    }

    // Prioritas 2: Titik dua :
    const colonIndex = rawTitle.indexOf(":");
    if (colonIndex !== -1) {
      return {
        main: rawTitle.substring(0, colonIndex + 1).trim(),
        sub: rawTitle.substring(colonIndex + 1).trim(),
      };
    }

    return { main: rawTitle, sub: "" };
  };

  const { main, sub } = parseTitleSubtitle(title);

  // Font Scaling Logic
  const calculateFontSize = (textStr: string) => {
    const chars = textStr.length;
    if (variant === "thumbnail") {
      if (chars < 80) return "text-[9px]";
      if (chars < 150) return "text-[7px]";
      return "text-[6px]";
    }
    
    if (chars < 80) return "text-[14px]";
    if (chars < 150) return "text-[11px]";
    if (chars < 220) return "text-[9px]";
    return "text-[7.5px]";
  };

  const mainFontSize = calculateFontSize(main + sub);

  return (
    <div 
      className={`relative inline-block w-full overflow-hidden rounded shadow-2xl border border-gray-800 bg-[#06142e] ${className}`}
      style={{ containerType: 'inline-size' }}
    >
      <img
        src={finalCoverUrl}
        alt={`Cover ${title}`}
        className="w-full aspect-[1/1.5] object-contain bg-[#06142e]"
      />
      
      {/* Container untuk teks judul yang melayang */}
      <div
        className="absolute font-serif drop-shadow-md overflow-hidden"
        style={{
          top: "31%",
          left: "6%",
          width: "46%",
          maxHeight: "59.5%",
        }}
      >
        <div className="mb-1.5">
          <span
            className="inline-block font-sans font-extrabold text-[#f0c05a] tracking-wider uppercase"
            style={{ fontSize: variant === 'thumbnail' ? '6px' : '9px' }}
          >
            {journalCode.split("-")[0].trim()}
          </span>
        </div>

        <div 
          className={`text-[#c9a84c] font-bold ${mainFontSize}`}
          style={{
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: "vertical",
            display: "-webkit-box",
            overflow: "hidden",
            lineHeight: "1.1"
          }}
        >
          {main}
          {sub && (
            <span 
              className="block font-normal text-gray-200 mt-0.5"
              style={{
                fontSize: variant === 'thumbnail' ? '6.5px' : '9px',
                lineHeight: '1.1'
              }}
            >
              {sub}
            </span>
          )}
        </div>
      </div>

      {/* DOI Overlay */}
      {doi && (
        <div 
          className="absolute z-10" 
          style={{ top: "11.5%", left: "33%", width: "42%" }}
        >
          <p
            className="font-bold text-[#c9a84c] tracking-wider mb-0.5"
            style={{ fontSize: variant === 'thumbnail' ? '6px' : '10px' }}
          >
            DOI
          </p>
          <p
            className="font-normal font-sans text-white truncate break-all leading-tight"
            style={{ fontSize: variant === 'thumbnail' ? '4.5px' : '7.5px' }}
          >
            {doi}
          </p>
        </div>
      )}

      {/* Volume & Edisi Overlay */}
      <div className="absolute flex flex-col justify-center" style={{ top: '89%', left: '26%', width: '20%' }}>
        {volume && (
          <p className="font-bold text-zinc-300 tracking-wider uppercase mb-0.5" style={{ fontSize: variant === 'thumbnail' ? '5px' : 'clamp(7px, 0.75vw, 11px)' }}>
            VOL {volume.replace(/^(Vol\.?|Volume)\s*/i, '').trim()}
          </p>
        )}
        {issue && (
          <p className="font-bold text-zinc-300 tracking-wider uppercase" style={{ fontSize: variant === 'thumbnail' ? '5px' : 'clamp(7px, 0.75vw, 11px)' }}>
            EDISI {issue.replace(/^(No\.?|Nomor|Edisi|Issue)\s*/i, '').replace(/\(.*\)/, '').trim()}
          </p>
        )}
      </div>

      {/* Month & Year Overlay */}
      <div className="absolute flex flex-col justify-center" style={{ top: '89%', left: '52%', width: '20%' }}>
        <p className="font-bold text-zinc-300 tracking-wider uppercase mb-0.5" style={{ fontSize: variant === 'thumbnail' ? '5px' : 'clamp(7px, 0.75vw, 11px)' }}>
          {(() => {
            const dateSource = publishedAt || createdAt;
            return (dateSource ? new Date(dateSource) : new Date()).toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          })()}
        </p>
        <p className="font-bold text-zinc-300 tracking-wider uppercase" style={{ fontSize: variant === 'thumbnail' ? '5px' : 'clamp(7px, 0.75vw, 11px)' }}>
          {(() => {
            const dateSource = publishedAt || createdAt;
            return (dateSource ? new Date(dateSource) : new Date()).getFullYear().toString();
          })()}
        </p>
      </div>
    </div>
  );
}
