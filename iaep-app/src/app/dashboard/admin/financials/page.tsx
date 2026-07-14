"use client";

import { useState } from "react";

export default function FinancialManagement() {
  const [activeTab, setActiveTab] = useState("stipends");

  const [stipends, setStipends] = useState<any[]>([]);
  const tasks: any[] = [];
  const royalties: any[] = [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-['Cinzel'] mb-1">Financials & Honorarium</h1>
          <p className="text-[#8888aa]">Centralized, digital financial management for the APASIFIC network.</p>
        </div>
        <div className="bg-[#12121f] rounded-lg p-3 border border-[#c9a84c]/20 shadow-lg text-right">
          <div className="text-xs text-[#8888aa] font-bold">TOTAL PENDING PAYOUTS</div>
          <div className="text-xl font-bold text-[#c9a84c]">Rp 5.750.000</div>
        </div>
      </div>

      <div className="bg-[#12121f] rounded-2xl shadow-xl border border-[rgba(201,168,76,0.2)] overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[rgba(201,168,76,0.2)] bg-[#18182e]">
          <button 
            onClick={() => setActiveTab("stipends")}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'stipends' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c] bg-[#1a1a2e]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Board Honorarium (Volume-Based)
          </button>
          <button 
            onClick={() => setActiveTab("tasks")}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'tasks' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c] bg-[#1a1a2e]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Task-Based Honorarium (Per-Review)
          </button>
          <button 
            onClick={() => setActiveTab("ledger")}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'ledger' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c] bg-[#1a1a2e]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Payout Ledger
          </button>
          <button 
            onClick={() => setActiveTab("royalties")}
            className={`flex-1 py-4 text-sm font-bold transition-colors ${activeTab === 'royalties' ? 'text-[#c9a84c] border-b-2 border-[#c9a84c] bg-[#1a1a2e]' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Author Royalties
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-0">
          {activeTab === "stipends" && (
            <div className="overflow-x-auto">
              <div className="p-6 bg-blue-900/10 border-b border-blue-900/30 text-sm text-blue-200">
                <strong>Rule:</strong> Structural Board members receive honorariums based on the volume of articles processed in a month (Base Rate × Total Articles).
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-5 font-semibold">Recipient</th>
                    <th className="p-5 font-semibold">Role</th>
                    <th className="p-5 font-semibold text-center">Total Articles</th>
                    <th className="p-5 font-semibold text-right">Base Honor</th>
                    <th className="p-5 font-semibold text-right">Total Amount</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {stipends.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a2e] transition-colors">
                      <td className="p-5 font-bold text-white align-top">{item.name}</td>
                      <td className="p-5 text-gray-400 text-sm align-top">{item.role}</td>
                      
                      <td className="p-5 text-center font-bold text-blue-400 align-top">
                        {item.details ? (
                          <div className="space-y-1">
                            {item.details.map((d: any, i: number) => (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-gray-500 mr-2">{d.level}:</span>
                                <span>{d.count}</span>
                              </div>
                            ))}
                            <div className="pt-1 mt-1 border-t border-gray-700 text-sm">
                              {item.details.reduce((sum, d) => sum + d.count, 0)}
                            </div>
                          </div>
                        ) : (
                          item.articles
                        )}
                      </td>

                      <td className="p-5 text-right text-gray-300 text-sm align-top">
                        {item.details ? (
                          <div className="space-y-1">
                            {item.details.map((d: any, i: number) => (
                              <div key={i} className="text-xs">
                                Rp {d.rate.toLocaleString('id-ID')}
                              </div>
                            ))}
                            <div className="pt-1 mt-1 border-t border-gray-700 opacity-0">-</div>
                          </div>
                        ) : (
                          `Rp ${item.baseRate?.toLocaleString('id-ID')}`
                        )}
                      </td>

                      <td className="p-5 text-right font-bold text-[#c9a84c] text-lg align-top">
                        {item.details ? (
                          <div className="flex flex-col h-full justify-end">
                            <span className="text-xl">
                              Rp {item.details.reduce((sum, d) => sum + (d.count * d.rate), 0).toLocaleString('id-ID')}
                            </span>
                          </div>
                        ) : (
                          `Rp ${((item.articles || 0) * (item.baseRate || 0)).toLocaleString('id-ID')}`
                        )}
                      </td>

                      <td className="p-5 align-top">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-5 text-right align-top">
                        {item.status === 'Pending' ? (
                          <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">Pay Now</button>
                        ) : (
                          <button className="text-gray-500 font-bold py-1.5 px-4 text-sm cursor-not-allowed">Processed</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="overflow-x-auto">
              <div className="p-6 bg-purple-900/10 border-b border-purple-900/30 text-sm text-purple-200">
                <strong>Rule:</strong> Freelance Reviewers get paid per review. Board Reviewers get this fee <strong>ON TOP</strong> of their fixed stipends.
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-5 font-semibold">Reviewer</th>
                    <th className="p-5 font-semibold">Task (Article)</th>
                    <th className="p-5 font-semibold">Fee</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tasks.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a2e] transition-colors">
                      <td className="p-5">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className={`text-xs font-bold mt-1 ${item.role.includes('Freelance') ? 'text-gray-500' : 'text-[#c9a84c]'}`}>
                          {item.role}
                        </div>
                      </td>
                      <td className="p-5 text-gray-300 text-sm">{item.article}<br/><span className="text-xs text-gray-600">Completed: {item.date}</span></td>
                      <td className="p-5 font-bold text-[#c9a84c]">{item.fee}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        {item.status === 'Pending' ? (
                          <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">Pay Now</button>
                        ) : (
                          <button className="text-gray-500 font-bold py-1.5 px-4 text-sm cursor-not-allowed">Processed</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "ledger" && (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-bold text-gray-400 mb-2">Digital Ledger Secure</p>
              <p className="text-sm">Payouts are logged systematically. Say goodbye to untraceable envelopes.</p>
            </div>
          )}

          {activeTab === "royalties" && (
            <div className="overflow-x-auto">
              <div className="p-6 bg-green-900/10 border-b border-green-900/30 text-sm text-green-200">
                <strong>Monetization:</strong> APASIFIC distributes royalties to authors from article paywall downloads.
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#111120] border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                    <th className="p-5 font-semibold">Author</th>
                    <th className="p-5 font-semibold">Published Article</th>
                    <th className="p-5 font-semibold text-center">Downloads</th>
                    <th className="p-5 font-semibold text-right">Accumulated Royalty</th>
                    <th className="p-5 font-semibold">Status</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {royalties.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a2e] transition-colors">
                      <td className="p-5 font-bold text-white align-top">{item.author}</td>
                      <td className="p-5 text-gray-300 text-sm align-top">
                        {item.article}<br/>
                        <span className="text-xs text-[#c9a84c]">{item.journal}</span>
                      </td>
                      <td className="p-5 text-center font-bold text-blue-400 align-top">
                        {item.downloads} <span className="text-xs font-normal text-gray-500">buys</span>
                      </td>
                      <td className="p-5 text-right font-bold text-green-400 text-lg align-top">
                        Rp {item.revenue.toLocaleString('id-ID')}
                      </td>
                      <td className="p-5 align-top">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${item.status === 'Paid' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-500'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-5 text-right align-top">
                        {item.status === 'Pending Payout' ? (
                          <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-1.5 px-4 rounded shadow transition-colors text-sm">Transfer Funds</button>
                        ) : (
                          <button className="text-gray-500 font-bold py-1.5 px-4 text-sm cursor-not-allowed">Processed</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
