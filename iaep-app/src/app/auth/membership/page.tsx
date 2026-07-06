"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import Image from "next/image";

export default function MajesticMembershipPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "",
    academicLevel: "S2",
    internationalId: "",
    university: "",
  });

  const [showPayment, setShowPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const countries = [
    "Indonesia", "Malaysia", "Singapore", "Thailand", "Vietnam", 
    "Philippines", "Japan", "South Korea", "China", "India", "Australia", "Other"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let amount = 0;
    if (formData.academicLevel === 'S2' || formData.academicLevel === 'Praktisi') amount = 250000;
    if (formData.academicLevel === 'S3' || formData.academicLevel === 'Profesor') amount = 500000;
    
    setPaymentAmount(amount);
    setShowPayment(true);
  };

  const handlePay = () => {
    alert("Payment Successful! Welcome to ASIA.");
    document.cookie = "mock_user=member; path=/";
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen text-[#e8e8f0] flex flex-col py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-20 animate-blob z-0"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#c9a84c] rounded-full mix-blend-color-dodge filter blur-[128px] opacity-10 animate-blob animation-delay-2000 z-0"></div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        
        <Link href="/">
          <div className="flex items-center gap-3 group cursor-pointer w-fit mb-8">
            <div className="w-10 h-10 rounded-full border-2 border-[#c9a84c] flex items-center justify-center text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-black transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
          </div>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Cinzel, serif' }}>
            Exclusive <span className="text-[#c9a84c]">ASIA Membership</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Join the elite circle of Asia Pacific academicians. Fill out the form below to instantly generate your official International Academic Member Card.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-32 text-gray-500 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm">
          <svg className="w-16 h-16 text-gray-600 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-xl tracking-widest uppercase mb-3 text-[#c9a84c]">Formulir Dibersihkan</p>
          <p className="text-base text-gray-400 max-w-lg text-center">Formulir pendaftaran dan sistem kartu keanggotaan sedang dinonaktifkan sementara untuk pembersihan dan perbaikan sistem.</p>
        </div>
      </div>
    </div>
  );
}

// Force rebuild - 2026-07-06
