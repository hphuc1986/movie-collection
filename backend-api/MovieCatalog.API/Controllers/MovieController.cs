using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieCatalog.Data;
using MovieCatalog.Data.Entities;
using System.Runtime.CompilerServices;

namespace MovieCatalog.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MovieController : ControllerBase
    {
        private readonly DataContext _context;

        public MovieController(DataContext context)
        {
            _context = context;
        }

        // 1. GET ALL MOVIES: api/movie
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Movie>>> GetMovies()
        {
            var movies = await _context.Movies.ToListAsync();
            return Ok(movies); // Returns HTTP 200 OK with the list of movies
        }

        // 2. GET SINGLE MOVIE BY ID: api/movie/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Movie>> GetMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
            {
                return NotFound($"Movie with ID {id} was not found."); // Returns HTTP 404
            }

            return Ok(movie);
        }

        // 3. POST (ADD NEW MOVIE): api/movie
        [HttpPost]
        public async Task<ActionResult<Movie>> AddMovie([FromBody] Movie movie)
        {
            if (movie == null)
            {
                return BadRequest("Movie data cannot be null."); // Returns HTTP 400
            }

            // Clean up incoming fields slightly
            movie.CreatedAt = DateTime.UtcNow;

            _context.Movies.Add(movie);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetMovie", new { id = movie.Id }, movie);
        }

        // 4. DELETE MOVIE: api/movie/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMovie(int id)
        {
            var movie = await _context.Movies.FindAsync(id);

            if (movie == null)
            {
                return NotFound($"Movie with ID {id} cannot be deleted because it doesn't exist.");
            }

            _context.Movies.Remove(movie);
            await _context.SaveChangesAsync();

            return NoContent(); // Returns HTTP 204 NoContent on successful deletions
        }

    }
}
