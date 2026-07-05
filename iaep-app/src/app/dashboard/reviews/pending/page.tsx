import Link from "next/link";

export default function PendingReviews() {
  // Dummy data representing pending reviews assigned to this user
  const assignments = [
    {
      id: 1,
      submissionId: 1045,
      title: "The Impact of Artificial Intelligence on Southeast Asian Higher Education",
      round: 1,
      dateAssigned: "2024-07-02",
      dateDue: "2024-07-30",
      status: "pending"
    },
    {
      id: 2,
      submissionId: 1089,
      title: "Sustainable Development Goals in Pacific Island Nations: A Policy Analysis",
      round: 2,
      dateAssigned: "2024-07-04",
      dateDue: "2024-08-01",
      status: "pending"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Pending Reviews</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <th className="p-4">Submission Title</th>
              <th className="p-4 hidden md:table-cell">Round</th>
              <th className="p-4 hidden md:table-cell">Assigned</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  You have no pending review assignments.
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-semibold text-gray-800 text-sm md:text-base">
                      {assignment.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Submission ID: #{assignment.submissionId}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                    Round {assignment.round}
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-gray-600">
                    {assignment.dateAssigned}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {assignment.dateDue}
                    </span>
                  </td>
                  <td className="p-4">
                    <Link href={`/dashboard/reviews/${assignment.id}`} className="inline-flex items-center justify-center bg-[#c9a84c] text-black font-semibold text-sm px-4 py-2 rounded shadow-sm hover:bg-[#b0923d] transition-colors">
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
