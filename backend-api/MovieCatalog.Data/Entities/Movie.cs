using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace MovieCatalog.Data.Entities
{
    [Table("Movie_Collection")]
    public class Movie
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Title { get; set; }= string.Empty;

        public int? ReleaseYear { get; set; }

        [StringLength(50)]
        public string? Format { get; set; } // e.g., "4K Ultra HD", "Blu-ray"

        public int? TmdbId { get; set; } // Map to Python scraper data later

        [Range(1, 5)]
        public int? Rating { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
