using Apasific.Backend.Shared.Domain;
using System;

namespace Apasific.Backend.Academic.Domain.StudyPrograms
{
    public class StudyProgram : AggregateRoot<Guid>
    {
        public string Code { get; private set; }
        public string Name { get; private set; }
        public Guid FacultyId { get; private set; }
        public bool IsActive { get; private set; }

        private StudyProgram() { } // ORM Required

        public static StudyProgram Register(Guid id, string code, string name, Guid facultyId)
        {
            if (string.IsNullOrWhiteSpace(code)) throw new DomainException("Study Program code is required.");
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Study Program name is required.");
            if (facultyId == Guid.Empty) throw new DomainException("Faculty ID is required.");

            return new StudyProgram
            {
                Id = id,
                Code = code,
                Name = name,
                FacultyId = facultyId,
                IsActive = true
            };
        }

        public void TransferTo(Guid newFacultyId)
        {
            if (newFacultyId == Guid.Empty) throw new DomainException("New Faculty ID must be provided for transfer.");
            if (!IsActive) throw new DomainException("Cannot transfer an inactive Study Program.");
            if (FacultyId == newFacultyId) throw new DomainException("Study Program is already assigned to this Faculty.");
            
            FacultyId = newFacultyId;
        }

        public void Activate() => IsActive = true;
        
        public void Deactivate() => IsActive = false;
    }
}
