using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using StudyTrackerApp.Models;

namespace StudyTrackerApp.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            optionsBuilder.UseSqlite("Data Source=studytracker.db");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}