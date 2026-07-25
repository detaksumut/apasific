import { ReviewStatus } from "@/domain/reviewer/ReviewStatus";
import { ReviewAssignmentRepository } from "@/repositories/ReviewAssignmentRepository";

export class ReviewQueueService {
  static async getPendingQueue(userId: string, email: string | null): Promise<any[]> {
    const list = await ReviewAssignmentRepository.getAssignmentsForReviewer(userId, email);
    return list.filter(a => a.status === ReviewStatus.Pending);
  }

  static async getActiveQueue(userId: string, email: string | null): Promise<any[]> {
    const list = await ReviewAssignmentRepository.getAssignmentsForReviewer(userId, email);
    return list.filter(a => 
      a.status === ReviewStatus.Accepted || 
      a.status === ReviewStatus.RevisionPending ||
      a.status === 'revision_pending'
    );
  }

  static async getCompletedQueue(userId: string, email: string | null): Promise<any[]> {
    const list = await ReviewAssignmentRepository.getAssignmentsForReviewer(userId, email);
    return list.filter(a => a.status === ReviewStatus.Completed);
  }

  static async getRevisionQueue(userId: string, email: string | null): Promise<any[]> {
    const list = await ReviewAssignmentRepository.getAssignmentsForReviewer(userId, email);
    // Revision queue includes assignments that are marked as revision_pending,
    // OR completed assignments that now have an author revision uploaded (submissions.revised_file_url)
    return list.filter(a => 
      a.status === ReviewStatus.RevisionPending || 
      a.status === 'revision_pending' ||
      (a.submissions?.revised_file_url && a.status === ReviewStatus.Completed)
    );
  }
}
