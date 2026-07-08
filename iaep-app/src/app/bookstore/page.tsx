'use client';

import React, { useState } from 'react';
import Head from 'next/head';

const MOCK_BOOKS = [
  {
    id: 1,
    title: "Advanced Artificial Intelligence in Economics",
    author: "Prof. Ahmad Fauzi, Ph.D.",
    year: "2025",
    category: "Monograph",
    price: "Rp 150.000",
    image: "https://dummyimage.com/400x600/18182e/c9a84c.png&text=AI+in+Economics",
    description: "An in-depth analysis of how AI is reshaping global economic policies.",
  },
  {
    id: 2,
    title: "Sustainable Business Strategies in ASEAN",
    author: "Dr. Sarah Jenkins, M.B.A.",
    year: "2026",
    category: "Academic Book",
    price: "Rp 200.000",
    image: "https://dummyimage.com/400x600/18182e/c9a84c.png&text=Sustainable+Business",
    description: "Exploring eco-friendly corporate strategies across Southeast Asia.",
  },
  {
    id: 3,
    title: "Journal of Digital Transformation (Vol. 4)",
    author: "Multiple Authors",
    year: "2026",
    category: "Journal",
    price: "Rp 75.000",
    image: "https://dummyimage.com/400x600/18182e/c9a84c.png&text=Digital+Transformation",
    description: "A compilation of peer-reviewed articles on digital trends.",
  },
  {
    id: 4,
    title: "International Conference on Islamic Finance",
    author: "ASIA Proceedings",
    year: "2024",
    category: "Proceedings",
    price: "Free",
    image: "https://dummyimage.com/400x600/18182e/c9a84c.png&text=Islamic+Finance+Proc.",
    description: "Proceedings from the annual ASIA Islamic Finance conference.",
  },
  {
    id: 5,
    title: "Public Health Policies Post-Pandemic",
    author: "Dr. Budi Santoso, M.Sc",
    year: "2025",
    category: "Policy Brief",
    price: "Rp 50.000",
    image: "https://dummyimage.com/400x600/18182e/c9a84c.png&text=Public+Health",
    description: "A concise brief on emerging public health challenges.",
  },
  {
    id: 6,
    title: "The Future of Tourism & Hospitality",
    author: "Prof. Elena Rossi",
    year: "2026",
    category: "Monograph",
    price: "Rp 180.000",
    image: "https://dummyimage.com/400x600/18182e/c9a84c.png&text=Future+Tourism",
    description: "Insights into the post-modern tourism industry dynamics.",
  }
];

export default function BookstorePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(MOCK_BOOKS.map(b => b.category)))];

  const filteredBooks = MOCK_BOOKS.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <Head>
        <title>Book Store | ASIA</title>
        <meta name="description" content="Explore premium academic books, journals, monographs, and proceedings published by the Association of Asia Pacific Academician." />
      </Head>

      {/* Hero Section */}
      <section className="bs-hero">
        <div className="bs-hero-content container">
          <h1 className="bs-title">ASIA <span className="gold">Book Store</span></h1>
          <p className="bs-subtitle">
            Discover a curated collection of premium academic publications, journals, proceedings, and monographs shaping the future of the Asia-Pacific region.
          </p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="bs-toolbar-section">
        <div className="container">
          <div className="bs-toolbar">
            <div className="bs-search">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search by title or author..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bs-input"
              />
            </div>
            <div className="bs-filters">
              {categories.map(cat => (
                <button 
                  key={cat} 
                  className={`bs-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Book Grid (Etalase) */}
      <section className="bs-grid-section">
        <div className="container">
          {filteredBooks.length > 0 ? (
            <div className="bs-grid">
              {filteredBooks.map(book => (
                <div key={book.id} className="bs-card">
                  <div className="bs-card-img-wrapper">
                    <img src={book.image} alt={book.title} className="bs-card-img" />
                    <span className="bs-badge">{book.category}</span>
                  </div>
                  <div className="bs-card-body">
                    <h3 className="bs-book-title">{book.title}</h3>
                    <p className="bs-book-author">By {book.author}</p>
                    <p className="bs-book-year">Published: {book.year}</p>
                    <p className="bs-book-desc">{book.description}</p>
                    <div className="bs-card-footer">
                      <span className="bs-price">{book.price}</span>
                      <button className="bs-buy-btn">Buy Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bs-empty-state">
              <h3>No books found matching your criteria.</h3>
              <button className="bs-reset-btn" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}>Reset Filters</button>
            </div>
          )}
        </div>
      </section>

      {/* Custom Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .bs-hero {
          background: linear-gradient(135deg, var(--bg-3) 0%, var(--bg) 100%);
          padding: 100px 0 60px;
          text-align: center;
          border-bottom: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }
        .bs-hero::before {
          content: "";
          position: absolute;
          top: -50%; left: 50%;
          width: 800px; height: 800px;
          background: radial-gradient(circle, var(--gold-glow) 0%, transparent 60%);
          transform: translateX(-50%);
          z-index: 0;
          pointer-events: none;
        }
        .bs-hero-content {
          position: relative;
          z-index: 1;
        }
        .bs-title {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 20px;
          font-family: 'Cinzel', serif;
          letter-spacing: 2px;
        }
        .bs-subtitle {
          font-size: 1.15rem;
          color: var(--text-muted);
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.8;
        }

        .bs-toolbar-section {
          padding: 30px 0;
          background: var(--bg);
          position: sticky;
          top: var(--nav-h);
          z-index: 100;
          border-bottom: 1px solid var(--border);
        }
        .bs-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          background: rgba(18,18,31,0.6);
          backdrop-filter: blur(12px);
          padding: 15px 25px;
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .bs-search {
          display: flex;
          align-items: center;
          background: rgba(0,0,0,0.3);
          border: 1px solid var(--border);
          border-radius: 30px;
          padding: 8px 20px;
          flex: 1;
          max-width: 400px;
          transition: var(--transition);
        }
        .bs-search:focus-within {
          border-color: var(--gold);
          box-shadow: 0 0 15px var(--gold-glow);
        }
        .search-icon {
          margin-right: 10px;
          opacity: 0.7;
        }
        .bs-input {
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 1rem;
          width: 100%;
          outline: none;
        }
        .bs-input::placeholder {
          color: var(--text-muted);
        }
        .bs-filters {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .bs-filter-btn {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition);
        }
        .bs-filter-btn:hover {
          background: rgba(201,168,76,0.1);
          color: var(--text);
        }
        .bs-filter-btn.active {
          background: var(--gold);
          color: #000;
          border-color: var(--gold);
        }

        .bs-grid-section {
          padding: 60px 0 100px;
          background: var(--bg);
        }
        .bs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }
        .bs-card {
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          overflow: hidden;
          transition: var(--transition);
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }
        .bs-card:hover {
          transform: translateY(-8px);
          border-color: var(--gold-h);
          box-shadow: 0 15px 30px rgba(0,0,0,0.5), 0 0 15px var(--gold-glow);
        }
        .bs-card-img-wrapper {
          position: relative;
          height: 250px;
          overflow: hidden;
          background: linear-gradient(135deg, #e8c97a 0%, #c9a84c 50%, #9a7a30 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .bs-card-img {
          width: auto;
          height: 100%;
          max-width: 100%;
          aspect-ratio: 2/3;
          object-fit: contain;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
          transition: transform 0.5s ease;
        }
        .bs-card:hover .bs-card-img {
          transform: scale(1.05);
        }
        .bs-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: rgba(0,0,0,0.8);
          color: var(--gold);
          padding: 5px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1px solid var(--gold-dark);
          backdrop-filter: blur(4px);
        }
        .bs-card-body {
          padding: 25px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .bs-book-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--white);
          margin-bottom: 8px;
          line-height: 1.4;
        }
        .bs-book-author {
          font-size: 0.9rem;
          color: var(--gold);
          margin-bottom: 4px;
        }
        .bs-book-year {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 15px;
        }
        .bs-book-desc {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 25px;
          flex: 1;
        }
        .bs-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 20px;
        }
        .bs-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--white);
        }
        .bs-buy-btn {
          background: transparent;
          color: var(--gold);
          border: 1px solid var(--gold);
          padding: 8px 20px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .bs-buy-btn:hover {
          background: var(--gold);
          color: #000;
          box-shadow: 0 0 15px var(--gold-glow);
        }

        .bs-empty-state {
          text-align: center;
          padding: 60px 20px;
          background: var(--bg-card);
          border-radius: var(--radius);
          border: 1px dashed var(--border);
        }
        .bs-empty-state h3 {
          color: var(--text-muted);
          margin-bottom: 20px;
          font-weight: 400;
        }
        .bs-reset-btn {
          background: var(--gold);
          color: #000;
          border: none;
          padding: 10px 25px;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
        }
        .bs-reset-btn:hover {
          box-shadow: 0 0 15px var(--gold-glow);
        }

        @media (max-width: 768px) {
          .bs-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .bs-search {
            max-width: 100%;
          }
          .bs-filters {
            overflow-x: auto;
            padding-bottom: 5px;
            flex-wrap: nowrap;
          }
          .bs-filter-btn {
            white-space: nowrap;
          }
        }
      `}} />
    </>
  );
}
