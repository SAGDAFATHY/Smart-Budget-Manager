using Core.Interfaces;
using Domin.DTOs;
using Domin.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly IWalletService _walletService;
        private readonly IReportService _reportService; 
        public ReportController(IReportService reportService)
        {
         
            _reportService = reportService; 
        }

        [HttpPost("Add")]
        public async Task<IActionResult> Add([FromBody] ReportDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _reportService.AddAsync(model);
            return Ok(new { message = "Report added successfully!", data = model });
        }
        [HttpPut("Update/{id}")]
        public async Task<IActionResult> Update(int id, ReportDto model)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var report = await _reportService.GetByIdAsync(id);
            if (report == null)
            {
                return BadRequest("Invalid Id");
            }
          
            await _reportService.UpdateAsync(id, model);
            return Ok(new { message = "report updated successfully!", data = model });
        }
        [HttpDelete("Delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var report = await _reportService.GetByIdAsync(id);
            if (report == null)
                return NotFound("report not found.");

            await _reportService.DeleteAsync(id);
            return Ok(new { message = "report deleted successfully!" });
        }
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _reportService.GetAllAsync();
            if (!reports.Any())
                return NotFound("No reports found.");

            return Ok(reports);
        }

        [HttpGet("GetById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var report = await _reportService.GetByIdAsync(id);
            if (report == null)
                return NotFound("report not found.");

            return Ok(report);
        }
        [HttpGet("GetByUserId/{id}")]
        public async  Task<IActionResult> GetByUserId(string id)
        {
            var reports = await _reportService.GetByUserId(id);
            if (reports == null)
                return NotFound("reports not found.");

            return Ok(reports);
        }

    }
}
