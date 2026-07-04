using Apasific.Backend.Shared.Results;
using MediatR;
using System;

namespace Apasific.Backend.Academic.Application.StudyPrograms.Commands
{
    public record RegisterStudyProgramCommand(string Code, string Name, Guid FacultyId) : IRequest<Result<Guid>>;

    public class RegisterStudyProgramCommandHandler : IRequestHandler<RegisterStudyProgramCommand, Result<Guid>>
    {
        // Placeholder for IFacultyRepository, IStudyProgramRepository, IUnitOfWork injection

        public async Task<Result<Guid>> Handle(RegisterStudyProgramCommand request, CancellationToken cancellationToken)
        {
            // 1. Cross-Aggregate Validation via Application Layer
            // var facultyIsActive = await _facultyRepository.IsActiveAsync(request.FacultyId, cancellationToken);
            // if (!facultyIsActive) return Result<Guid>.Failure(new Error("Faculty.Invalid", "Cannot register Study Program under an invalid or inactive Faculty."));

            // 2. Aggregate Invariant Enforcement via Domain Layer
            var studyProgramId = Guid.NewGuid();
            var studyProgram = Domain.StudyPrograms.StudyProgram.Register(studyProgramId, request.Code, request.Name, request.FacultyId);
            
            // 3. Persist
            // _studyProgramRepository.Add(studyProgram);
            // await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result<Guid>.Success(studyProgramId);
        }
    }
}
