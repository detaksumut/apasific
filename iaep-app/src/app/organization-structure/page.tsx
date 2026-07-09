"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Data types
interface Leader {
  jabatan: string;
  nama: string;
  afiliasi: string;
  foto: string;
}

// Tree Node Component
const TreeNode = ({ title, name, photo, childrenNodes }: { title: string, name?: string, photo?: string, childrenNodes?: React.ReactNode }) => {
  return (
    <li>
      <div className="org-node">
        <div className="org-photo">
          {photo ? (
            <img src={photo} alt={name} />
          ) : (
            <div className="org-photo-placeholder">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
          )}
        </div>
        <div className="org-info">
          <div className="org-title">{title}</div>
          <div className="org-name">{name || "To Be Appointed"}</div>
        </div>
      </div>
      {childrenNodes && (
        <ul>
          {childrenNodes}
        </ul>
      )}
    </li>
  );
};

export default function OrganizationStructurePage() {
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const homeRes = await fetch(`/api/leadership?body=${encodeURIComponent('Struktur Organisasi ASIA (Home)')}`);
        const homeData = await homeRes.json();
        
        const certRes = await fetch(`/api/leadership?body=${encodeURIComponent('ASIACERT')}`);
        const certData = await certRes.json();
        
        const pubRes = await fetch(`/api/leadership?body=${encodeURIComponent('ASIA Publication & Knowledge Center (ASIA-PKC)')}`);
        const pubData = await pubRes.json();
        
        setData({
          home: homeData,
          cert: certData,
          pub: pubData
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAll();
  }, []);

  // Helper to extract member by title from home members array
  const getHomeMember = (titleSubstring: string) => {
    if (!data.home?.members) return null;
    return data.home.members.find((m: any) => m.jabatan.toLowerCase().includes(titleSubstring.toLowerCase()));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-[#c9a84c]">
        <div className="animate-pulse flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 mb-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="15 85"/></svg>
          <p className="font-semibold tracking-widest uppercase">Loading Structure...</p>
        </div>
      </div>
    );
  }

  const founder = getHomeMember("Founding Father");
  const advisor = getHomeMember("Advisor");
  const president = getHomeMember("President");
  // Vice Presidents
  const vpAdmin = getHomeMember("Vice President") || { nama: "DR. MUHAMMAD YAMIN NOCH., SE., MSA" }; // Fallback since VP title is shared
  const vpResearch = getHomeMember("Vice President") || { nama: "PROF. DR. ISTIANINGSIH SASTRODIHARJO., SE., M.Si" };

  return (
    <div className="min-h-screen bg-[#05050a] text-[#e8e8f0] relative overflow-hidden" style={{ paddingTop: '120px', paddingBottom: '80px' }}>
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-10 animate-blob z-0" style={{ width: '400px', height: '400px' }}></div>
      <div className="absolute bottom-0 right-1/4 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-10 animate-blob animation-delay-2000 z-0" style={{ width: '400px', height: '400px' }}></div>

      <div className="w-full mx-auto relative z-10 px-4" style={{ maxWidth: '1440px' }}>
        
        <Link href="/">
          <div className="flex items-center group cursor-pointer w-fit mb-8" style={{ gap: '12px' }}>
            <div className="rounded-full border-2 border-[#c9a84c] flex items-center justify-center text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-black transition-all" style={{ width: '40px', height: '40px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
          </div>
        </Link>

        <div className="text-center mb-16">
          <p className="text-[#c9a84c] font-semibold tracking-widest uppercase mb-2" style={{ fontSize: '14px' }}>Association of Asia Pacific Academician</p>
          <h1 className="font-bold tracking-tight" style={{ fontFamily: 'Cinzel, serif', fontSize: '42px' }}>
            Organizational <span className="text-[#c9a84c]">Structure</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent mx-auto mt-6"></div>
          <p className="mt-4 text-gray-400 text-sm max-w-lg mx-auto">
            Scroll horizontally to view the full organizational chart. Drag or use shift+scroll.
          </p>
        </div>

        {/* Tree Container with horizontal scroll */}
        <div 
          className="tree-container overflow-x-auto pb-16 pt-8 px-8 cursor-grab active:cursor-grabbing hide-scrollbar"
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          <div className="tree w-max mx-auto">
            <ul>
              {/* FOUNDER */}
              <TreeNode title="Founder" name={founder?.nama} photo={founder?.foto} childrenNodes={
                <TreeNode title="Co-Founder" childrenNodes={
                  <TreeNode title="Board of Advisors" name={advisor?.nama} photo={advisor?.foto} childrenNodes={
                    <TreeNode title="President" name={president?.nama} photo={president?.foto} childrenNodes={
                      <>
                        {/* VP Publication */}
                        <TreeNode title="Vice President Publication" name={data.pub?.ketuaNama} photo={data.pub?.ketuaPhoto} childrenNodes={
                          <>
                            <TreeNode title="Editor in Chief" />
                            <TreeNode title="Managing Editor" name={data.pub?.sekNama} photo={data.pub?.sekretarisPhoto} />
                            <TreeNode title="Editorial Board" />
                            <TreeNode title="Reviewer Board" />
                            <TreeNode title="Publication Director" />
                          </>
                        } />

                        {/* VP Certification */}
                        <TreeNode title="Vice President Certification" name={data.cert?.ketuaNama} photo={data.cert?.ketuaPhoto} childrenNodes={
                          <>
                            <TreeNode title="Chairman of Certification" />
                            <TreeNode title="Examination Board" />
                            <TreeNode title="Interview Board" />
                            <TreeNode title="Certification Assessors" />
                            <TreeNode title="Certification Admin" name={data.cert?.sekNama} photo={data.cert?.sekretarisPhoto} />
                          </>
                        } />

                        {/* Other VPs */}
                        <TreeNode title="Vice President Membership" />
                        <TreeNode title="Vice President Research" name={vpResearch?.nama} photo={vpResearch?.foto} />
                        <TreeNode title="Vice President Conference" />
                        <TreeNode title="Vice President Int. Affairs" />
                        <TreeNode title="Vice President Digital Platform" name={getHomeMember("Information")?.nama} photo={getHomeMember("Information")?.foto} />
                        <TreeNode title="Vice President Finance" name={getHomeMember("Treasurer")?.nama} photo={getHomeMember("Treasurer")?.foto} />
                        <TreeNode title="Vice President Administration" name={getHomeMember("Secretary")?.nama} photo={getHomeMember("Secretary")?.foto} />
                      </>
                    } />
                  } />
                } />
              } />
            </ul>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .tree-container {
          width: 100%;
          user-select: none;
        }
        /* CSS Tree Styles */
        .tree ul {
          padding-top: 40px; 
          position: relative;
          transition: all 0.5s;
          display: flex;
          justify-content: center;
          padding-left: 0;
        }
        .tree li {
          float: left; 
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 40px 10px 0 10px;
          transition: all 0.5s;
        }
        /* Connectors */
        .tree li::before, .tree li::after{
          content: '';
          position: absolute; top: 0; right: 50%;
          border-top: 2px solid rgba(201,168,76, 0.4);
          width: 50%; height: 40px;
        }
        .tree li::after{
          right: auto; left: 50%;
          border-left: 2px solid rgba(201,168,76, 0.4);
        }
        .tree li:only-child::after, .tree li:only-child::before {
          display: none;
        }
        .tree li:only-child { padding-top: 0; }
        .tree li:first-child::before, .tree li:last-child::after {
          border: 0 none;
        }
        .tree li:last-child::before {
          border-right: 2px solid rgba(201,168,76, 0.4);
          border-radius: 0 10px 0 0;
        }
        .tree li:first-child::after {
          border-radius: 10px 0 0 0;
        }
        .tree ul ul::before {
          content: '';
          position: absolute; top: 0; left: 50%;
          border-left: 2px solid rgba(201,168,76, 0.4);
          width: 0; height: 40px;
        }
        /* Node Styles */
        .org-node {
          background: rgba(13, 13, 26, 0.85);
          border: 1px solid rgba(201,168,76, 0.3);
          padding: 20px 15px;
          text-decoration: none;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          border-radius: 12px;
          transition: all 0.3s ease;
          width: 220px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          backdrop-filter: blur(10px);
          position: relative;
          z-index: 2;
        }
        .org-node:hover {
          background: rgba(20, 20, 35, 0.95);
          border-color: rgba(201,168,76, 0.8);
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(201,168,76,0.15);
        }
        .org-photo {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: 2px solid #c9a84c;
          margin-bottom: 12px;
          overflow: hidden;
          background: #0a0a14;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .org-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .org-photo-placeholder {
          color: #4b5563;
        }
        .org-title {
          font-size: 13px;
          color: #c9a84c;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 6px;
          line-height: 1.3;
        }
        .org-name {
          font-size: 14px;
          color: #e8e8f0;
          font-weight: 500;
          line-height: 1.3;
        }
      `}} />
    </div>
  );
}
