'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSearchParams } from 'next/navigation';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('bookId');
  
  const [book, setBook] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("mock_admin_books");
    if (saved && bookId) {
      const parsed = JSON.parse(saved);
      const foundBook = parsed.find((b: any) => b.id.toString() === bookId);
      if (foundBook) {
        setBook({
          ...foundBook,
          image: foundBook.image || `https://dummyimage.com/400x600/18182e/c9a84c.png&text=${encodeURIComponent(foundBook.title.split(' ').slice(0, 2).join('+'))}`
        });
      }
    }
    setIsLoaded(true);
  }, [bookId]);

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsProcessing(true);

    const formData = new FormData(e.currentTarget);
    const buyerName = formData.get('buyerName') as string;
    const buyerEmail = formData.get('buyerEmail') as string;
    const buyerPhone = formData.get('buyerPhone') as string;
    const receiptFile = document.getElementById('receipt') as HTMLInputElement;

    let receiptBase64 = "";
    if (receiptFile?.files?.[0]) {
      receiptBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(receiptFile.files![0]);
      });
    }

    const newOrderId = `ASIA-${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);

    const orderData = {
      orderId: newOrderId,
      date: new Date().toISOString(),
      buyerName,
      buyerEmail,
      buyerPhone,
      bookId: book.id,
      bookTitle: book.title,
      totalAmount: book.price,
      receiptImage: receiptBase64,
      status: 'Menunggu Verifikasi'
    };

    const savedOrders = localStorage.getItem("mock_admin_orders");
    const orders = savedOrders ? JSON.parse(savedOrders) : [];
    orders.unshift(orderData);
    localStorage.setItem("mock_admin_orders", JSON.stringify(orders));

    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (!isLoaded) return null;

  return (
    <>
      <Head>
        <title>Checkout | ASIA Book Store</title>
      </Head>

      <div className="co-page">
        <div className="container">
          {isSuccess ? (
            <div className="co-success-container">
              <div className="co-success-card">
                <svg className="co-success-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="co-success-title">Pembayaran Berhasil!</h2>
                <p className="co-success-desc">Terima kasih atas pesanan Anda. Resi dan tautan unduhan (jika ada) telah dikirimkan ke email Anda.</p>
                
                <div className="co-receipt">
                  <div className="co-receipt-item">
                    <span>Order ID</span>
                    <strong>#{orderId}</strong>
                  </div>
                  <div className="co-receipt-item">
                    <span>Item</span>
                    <strong>{book?.title}</strong>
                  </div>
                  <div className="co-receipt-item">
                    <span>Total dibayar</span>
                    <strong>{book?.price}</strong>
                  </div>
                </div>

                <button onClick={() => window.location.href = '/bookstore'} className="co-btn co-btn-primary mt-6">
                  Kembali ke Toko
                </button>
              </div>
            </div>
          ) : !book ? (
            <div className="co-empty-state">
              <h2>Buku tidak ditemukan</h2>
              <p>Maaf, buku yang Anda cari tidak tersedia atau sesi checkout telah kedaluwarsa.</p>
              <button onClick={() => window.location.href = '/bookstore'} className="co-btn co-btn-primary">Kembali ke Toko</button>
            </div>
          ) : (
            <>
              <div className="co-header">
                <h1>Secure Checkout</h1>
                <p>Selesaikan pembayaran untuk pesanan Anda.</p>
              </div>

              <div className="co-grid">
                {/* Billing Form */}
                <div className="co-form-section">
                  <h2 className="co-section-title">Billing Details</h2>
                  <form id="checkout-form" onSubmit={handlePayment} className="co-form">
                    <div className="co-form-group">
                      <label>Nama Lengkap</label>
                      <input type="text" name="buyerName" required placeholder="Contoh: Budi Santoso" />
                    </div>
                    <div className="co-form-group">
                      <label>Alamat Email</label>
                      <input type="email" name="buyerEmail" required placeholder="Contoh: budi@university.ac.id" />
                    </div>
                    <div className="co-form-group">
                      <label>Nomor Handphone (WhatsApp)</label>
                      <input type="tel" name="buyerPhone" required placeholder="Contoh: 081234567890" />
                    </div>

                    <h2 className="co-section-title mt-8">Payment Method</h2>
                    
                    <div className="co-payment-methods">
                      <label className="co-payment-option selected">
                        <input type="radio" name="payment" value="bni" defaultChecked />
                        <div className="co-payment-label">
                          <span className="font-bold">BNI Virtual Account (Disarankan)</span>
                          <span className="text-sm text-gray-400 mt-1">Transfer langsung ke rekening Bank BNI</span>
                        </div>
                      </label>
                    </div>

                    <div className="co-payment-instruction">
                      <p className="mb-2 text-sm text-gray-400">Silakan transfer sesuai nominal pesanan ke rekening berikut:</p>
                      <div className="co-bank-details">
                        <img src="/logobni.png" alt="BNI" className="co-bank-logo" />
                        <div>
                          <div className="text-xs text-gray-400">Bank Negara Indonesia (BNI)</div>
                          <div className="font-mono text-xl font-bold text-white tracking-wider my-1">700 600 2218</div>
                          <div className="text-sm text-[#c9a84c]">a.n. Association of Asia Pacific Academician</div>
                          <div className="text-xs text-gray-500 mt-1">Swift Code: BNINIDJA</div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Order Summary */}
                <div className="co-summary-section">
                  <div className="co-summary-card">
                    <h2 className="co-section-title mb-6">Order Summary</h2>
                    
                    <div className="co-item">
                      <img src={book.image} alt={book.title} className="co-item-img" />
                      <div className="co-item-details">
                        <h3 className="co-item-title">{book.title}</h3>
                        <p className="co-item-author">{book.author}</p>
                        <p className="co-item-price">{book.price}</p>
                      </div>
                    </div>

                    <div className="co-totals">
                      <div className="co-total-row">
                        <span>Subtotal</span>
                        <span>{book.price}</span>
                      </div>
                      <div className="co-total-row">
                        <span>Pajak (0%)</span>
                        <span>Rp 0</span>
                      </div>
                      <div className="co-total-row co-grand-total">
                        <span>Total Bayar</span>
                        <span className="text-[#c9a84c]">{book.price}</span>
                      </div>
                    </div>

                    <button 
                      form="checkout-form"
                      type="submit" 
                      className={`co-btn co-btn-block co-btn-primary ${isProcessing ? 'processing' : ''}`}
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Memproses...' : 'Konfirmasi Pembayaran'}
                    </button>

                    <div className="co-form-group" style={{ marginTop: '24px', textAlign: 'left' }}>
                      <label style={{ color: '#8888aa', fontSize: '0.875rem', marginBottom: '8px', display: 'block' }}>Unggah Bukti Transfer (Wajib)</label>
                      <div className="flex items-center justify-center w-full mt-2">
                        <label htmlFor="receipt" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#2a2a3e] rounded-lg cursor-pointer bg-[#0a0a10] hover:bg-[#12121f] transition-colors relative overflow-hidden group">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <svg className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#c9a84c] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-1 text-sm text-gray-400"><span className="font-semibold text-[#c9a84c]">Klik untuk mengunggah</span> atau seret file ke sini</p>
                            <p className="text-xs text-gray-500">JPG, PNG, atau PDF (Maks. 5MB)</p>
                          </div>
                          <input id="receipt" form="checkout-form" type="file" required accept="image/*,.pdf" className="hidden" onChange={(e) => {
                            const label = e.target.parentElement;
                            if (label && e.target.files && e.target.files[0]) {
                              label.style.borderColor = '#c9a84c';
                              label.style.borderStyle = 'solid';
                              const p = label.querySelector('p');
                              if(p) p.innerHTML = `<span class="text-[#c9a84c] font-bold">✓ File terpilih:</span> ${e.target.files[0].name}`;
                            }
                          }} />
                        </label>
                      </div>
                    </div>
                    
                    <p className="co-secure-badge">
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                      Secure SSL Encrypted Payment
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --co-bg: #0a0a10;
          --co-card: #12121f;
          --co-border: #2a2a3e;
          --co-gold: #c9a84c;
          --co-gold-hover: #e8c97a;
          --co-text: #e0e0e0;
          --co-muted: #8888aa;
        }

        .co-page {
          background-color: var(--co-bg);
          min-height: 100vh;
          color: var(--co-text);
          padding: 60px 0 100px;
          font-family: 'Inter', sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .co-header {
          text-align: center;
          margin-bottom: 50px;
        }

        .co-header h1 {
          font-family: 'Cinzel', serif;
          font-size: 2.5rem;
          color: #fff;
          margin-bottom: 10px;
        }

        .co-header p {
          color: var(--co-muted);
        }

        .co-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .co-grid { grid-template-columns: 1fr; }
        }

        .co-section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--co-border);
        }

        .co-form {
          background: var(--co-card);
          padding: 32px;
          border-radius: 16px;
          border: 1px solid var(--co-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .co-form-group {
          margin-bottom: 20px;
        }

        .co-form-group label {
          display: block;
          font-size: 0.875rem;
          color: var(--co-muted);
          margin-bottom: 8px;
        }

        .co-form-group input {
          width: 100%;
          background: var(--co-bg);
          border: 1px solid var(--co-border);
          padding: 12px 16px;
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .co-form-group input:focus {
          outline: none;
          border-color: var(--co-gold);
        }

        .co-payment-methods {
          margin-bottom: 20px;
        }

        .co-payment-option {
          display: flex;
          align-items: center;
          padding: 16px;
          border: 2px solid var(--co-gold);
          border-radius: 8px;
          background: rgba(201, 168, 76, 0.05);
          cursor: pointer;
        }

        .co-payment-option input {
          margin-right: 16px;
          accent-color: var(--co-gold);
        }

        .co-payment-label {
          display: flex;
          flex-direction: column;
        }

        .co-payment-instruction {
          background: var(--co-bg);
          padding: 20px;
          border-radius: 8px;
          border: 1px solid var(--co-border);
          margin-top: 16px;
        }

        .co-bank-details {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px;
          background: var(--co-card);
          border-radius: 8px;
          border: 1px solid var(--co-border);
        }

        .co-bank-logo {
          height: 30px;
          width: auto;
          background: #fff;
          padding: 4px;
          border-radius: 4px;
        }

        /* Summary Section */
        .co-summary-card {
          background: var(--co-card);
          padding: 32px;
          border-radius: 16px;
          border: 1px solid var(--co-border);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          position: sticky;
          top: 30px;
        }

        .co-item {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
        }

        .co-item-img {
          width: 80px;
          height: 120px;
          object-fit: contain;
          border-radius: 6px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }

        .co-item-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #fff;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .co-item-author {
          font-size: 0.875rem;
          color: var(--co-muted);
          margin-bottom: 12px;
        }

        .co-item-price {
          font-weight: bold;
          color: var(--co-gold);
          font-size: 1.1rem;
        }

        .co-totals {
          border-top: 1px solid var(--co-border);
          padding-top: 20px;
          margin-bottom: 30px;
        }

        .co-total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          color: var(--co-muted);
        }

        .co-grand-total {
          font-size: 1.25rem;
          font-weight: bold;
          color: #fff;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px dashed var(--co-border);
        }

        .co-btn {
          padding: 16px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          text-align: center;
        }

        .co-btn-block {
          width: 100%;
          display: block;
        }

        .co-btn-primary {
          background: var(--co-gold);
          color: #000;
          box-shadow: 0 0 20px rgba(201, 168, 76, 0.2);
        }

        .co-btn-primary:hover:not(:disabled) {
          background: var(--co-gold-hover);
          transform: translateY(-2px);
          box-shadow: 0 5px 25px rgba(201, 168, 76, 0.3);
        }

        .co-btn-primary.processing {
          opacity: 0.7;
          cursor: not-allowed;
          background: var(--co-muted);
        }

        .co-secure-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--co-muted);
          font-size: 0.8rem;
          margin-top: 16px;
        }

        /* Success State */
        .co-success-container {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 0;
        }

        .co-success-card {
          background: var(--co-card);
          padding: 48px;
          border-radius: 16px;
          border: 1px solid var(--co-gold);
          box-shadow: 0 0 40px rgba(201, 168, 76, 0.15);
          text-align: center;
          max-width: 500px;
          width: 100%;
          animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .co-success-icon {
          width: 80px;
          height: 80px;
          color: var(--co-gold);
          margin: 0 auto 24px;
        }

        .co-success-title {
          font-size: 2rem;
          font-family: 'Cinzel', serif;
          color: #fff;
          margin-bottom: 16px;
        }

        .co-success-desc {
          color: var(--co-muted);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .co-receipt {
          background: var(--co-bg);
          padding: 24px;
          border-radius: 8px;
          text-align: left;
          border: 1px solid var(--co-border);
        }

        .co-receipt-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.9rem;
        }
        
        .co-receipt-item:last-child {
          margin-bottom: 0;
          padding-top: 12px;
          border-top: 1px dashed var(--co-border);
          margin-top: 12px;
        }

        .co-receipt-item span {
          color: var(--co-muted);
        }

        .co-receipt-item strong {
          color: #fff;
          text-align: right;
          max-width: 60%;
        }

        .co-empty-state {
          text-align: center;
          padding: 100px 0;
        }
        
        .co-empty-state h2 {
          color: #fff;
          margin-bottom: 16px;
          font-size: 2rem;
        }
        
        .co-empty-state p {
          color: var(--co-muted);
          margin-bottom: 32px;
        }

        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .mt-6 { margin-top: 24px; }
        .mt-8 { margin-top: 32px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-6 { margin-bottom: 24px; }
        .font-bold { font-weight: bold; }
        .text-sm { font-size: 0.875rem; }
        .text-xs { font-size: 0.75rem; }
        .text-gray-400 { color: #9ca3af; }
        .font-mono { font-family: monospace; }
        .text-lg { font-size: 1.125rem; }
        .tracking-wider { letter-spacing: 0.05em; }
        .my-1 { margin-top: 4px; margin-bottom: 4px; }
      `}} />
    </>
  );
}
