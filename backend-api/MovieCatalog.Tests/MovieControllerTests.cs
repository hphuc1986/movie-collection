using Xunit;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MovieCatalog.API.Controllers;
using MovieCatalog.Data;
using MovieCatalog.Data.Entities;

namespace MovieCatalog.Tests
{
    public class MovieControllerTests
    {
        // Helper method to generate a clean, isolated In-Memory database for every single test run
        private DataContext GetInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<DataContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Unique name prevents tests bleeding into each other
                .Options;

            return new DataContext(options);
        }

        [Fact]
        public async Task GetMovies_WhenCollectionHasMovies_ShouldReturnOkWithAllMovies()
        {
            // --- ARRANGE ---
            var context = GetInMemoryDbContext();
            context.Movies.AddRange(new List<Movie>
            {
                new Movie { Id = 1, Title = "Inception", ReleaseYear = 2010 },
                new Movie { Id = 2, Title = "The Matrix", ReleaseYear = 1999 }
            });
            await context.SaveChangesAsync();

            var controller = new MovieController(context);

            // --- ACT ---
            var result = await controller.GetMovies();

            // --- ASSERT ---
            var okResult = result.Result.As<OkObjectResult>();
            okResult.Should().NotBeNull();
            okResult.StatusCode.Should().Be(200);

            var movies = okResult.Value.As<IEnumerable<Movie>>();
            movies.Should().HaveCount(2);
            movies.First().Title.Should().Be("Inception");
        }

        [Fact]
        public async Task GetMovie_WithInvalidId_ShouldReturnNotFound()
        {
            // --- ARRANGE ---
            var context = GetInMemoryDbContext(); // Empty DB instance
            var controller = new MovieController(context);

            // --- ACT ---
            var result = await controller.GetMovie(999); // ID that doesn't exist

            // --- ASSERT ---
            var notFoundResult = result.Result.As<NotFoundObjectResult>();
            notFoundResult.Should().NotBeNull();
            notFoundResult.StatusCode.Should().Be(404);
            notFoundResult.Value.Should().Be("Movie with ID 999 was not found.");
        }
    }
}
