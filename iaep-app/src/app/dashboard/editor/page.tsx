"use client";

import { useState } from "react";
import Link from "next/link";

export default function EditorDashboard() {
  const [activeTab, setActiveTab] = useState("unassigned");

  // Dummy manuscripts mimicking OJS submissions
  const manuscripts = [
    {
      id: 1045,
      title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
      author: "Jane Doe",
      dateSubmitted: "2024-07-01",
      stage: "unassigned",
      daysInStage: 3
    },
    {
      id: 1089,
      title: "Sustainable Development Goals in Pacific Island Nations: A Policy Analysis",
      author: "Robert Smith",
      dateSubmitted: "2024-06-25",
      stage: "in_review",
      daysInStage: 10
    },
    {
      id: 1092,
      title: "Economic Resilience in ASEAN during the Post-Pandemic Era",
      author: "Ahmad Ibrahim",
      dateSubmitted: "2024-06-15",
      stage: "copyediting",
      daysInStage: 5
    }
  ];

  const filteredManuscripts = manuscripts.filter(m => m.stage === activeTab);

  const tabs = [
    { id: 'unassigned', label: 'Unassigned', count: 1 },
    { id: 'in_review', label: 'In Review', count: 1 },
    { id: 'copyediting', label: 'Copyediting', count: 1 },
    { id: 'production', label: 'Production', count: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Editorial Board</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Kanban Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 text-sm font-semibold text-center whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? 'border-b-2 border-[#c9a84c] text-[#c9a84c] bg-gray-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-[#c9a84c]/20 text-[#9a7a30]' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Master List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="p-4">ID</th>
                <th className="p-4">Title & Author</th>
                <th className="p-4 hidden md:table-cell">Date Submitted</th>
                <th className="p-4 hidden md:table-cell">Days in Stage</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredManuscripts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-500">
                    <div className="text-4xl mb-2">📄</div>
                    No manuscripts found in this stage.
                  </td>
                </tr>
              ) : (
                filteredManuscripts.map((manuscript) => (
                  <tr key={manuscript.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-500">
                      #{manuscript.id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-800 text-sm md:text-base">
                        {manuscript.title}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        By {manuscript.author}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                      {manuscript.dateSubmitted}
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        manuscript.daysInStage > 7 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {manuscript.daysInStage} days
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link 
                        href={`/dashboard/editor/submissions/${manuscript.id}`} 
                        className="inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-semibold text-sm px-4 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
