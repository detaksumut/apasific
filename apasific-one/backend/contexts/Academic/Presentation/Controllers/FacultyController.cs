using Apasific.Backend.Academic.Application.Faculty.Commands;
using Apasific.Backend.Academic.Application.Faculty.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace Apasific.Backend.Academic.Presentation.Controllers
{
    [ApiController]
    [Route("api/v1/academic/[controller]")]
    public class FacultyController : ControllerBase
    {
        private readonly IMediator _mediator;

        public FacultyController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFaculty([FromBody] CreateFacultyCommand command)
        {
            var result = await _mediator.Send(command);
            if (result.IsSuccess) return Ok(result.Value);
            return BadRequest(result.Error);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFaculty(Guid id)
        {
            var result = await _mediator.Send(new GetFacultyByIdQuery(id));
            if (result.IsSuccess) return Ok(result.Value);
            return NotFound(result.Error);
        }
    }
}
