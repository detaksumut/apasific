using Apasific.Backend.Shared.Domain;
using System;

namespace Apasific.Backend.Academic.Domain.Faculty
{
    public class Faculty : AggregateRoot<Guid>
    {
        public string Code { get; private set; }
        public string Name { get; private set; }
        public bool IsActive { get; private set; }
        public Guid? DeanId { get; private set; }

        private Faculty() { } // ORM Required

        public static Faculty Create(Guid id, string code, string name)
        {
            if (string.IsNullOrWhiteSpace(code)) throw new DomainException("Faculty code is required.");
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Faculty name is required.");

            return new Faculty
            {
                Id = id,
                Code = code,
                Name = name,
                IsActive = true
            };
        }

        public void UpdateDetails(string name, Guid? deanId)
        {
            if (string.IsNullOrWhiteSpace(name)) throw new DomainException("Faculty name is required.");
            
            Name = name;
            DeanId = deanId;
        }

        public void Activate() => IsActive = true;
        public void Deactivate() => IsActive = false;
    }
}
