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
      <div className="w-full max-w-7xl mx-auto relative z-10">
        <Link href="/">
          <div className="flex items-center gap-3 group cursor-pointer w-fit mb-8">
            <div className="w-10 h-10 rounded-full border-2 border-[#c9a84c] flex items-center justify-center text-[#c9a84c] group-hover:bg-[#c9a84c] group-hover:text-black transition-all">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </div>
            <span className="font-semibold text-gray-400 group-hover:text-white transition-colors">Back to Home</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

// Force rebuild - 2026-07-06
