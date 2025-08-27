import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

// Define types for testimonials
interface Testimonial {
  id: number;
  filename: string;
  alt: string;
  date: string;
  userType: 'parent' | 'educator' | 'child';
}

const TestimonialsPage: React.FC = () => {
  // In a real implementation, this would come from an API or database
  // For now, we'll generate it from the images we have
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [filter, setFilter] = useState<'all' | 'parent' | 'educator' | 'child'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const testimonialsPerPage = 9;

  // Initialize testimonials from images
  useEffect(() => {
    // In a real implementation, we would fetch this data from an API
    // For now, we'll generate mock data based on the images we moved
    const mockTestimonials: Testimonial[] = [
      { id: 1, filename: 'Skärmbild 2025-07-22 004844.png', alt: 'Parent testimonial about Tale Forge', date: '2025-07-22', userType: 'parent' },
      { id: 2, filename: 'Skärmbild 2025-07-22 004956.png', alt: 'Educator testimonial about using Tale Forge in classroom', date: '2025-07-22', userType: 'educator' },
      { id: 3, filename: 'Skärmbild 2025-07-22 023335.png', alt: 'Parent testimonial about child engagement', date: '2025-07-22', userType: 'parent' },
      { id: 4, filename: 'Skärmbild 2025-07-22 023535.png', alt: 'Child testimonial about favorite story', date: '2025-07-22', userType: 'child' },
      { id: 5, filename: 'Skärmbild 2025-07-22 023545.png', alt: 'Parent testimonial about educational value', date: '2025-07-22', userType: 'parent' },
      { id: 6, filename: 'Skärmbild 2025-07-22 023816.png', alt: 'Educator testimonial about creativity boost', date: '2025-07-22', userType: 'educator' },
      { id: 7, filename: 'Skärmbild 2025-07-22 023819.png', alt: 'Parent testimonial about family bonding', date: '2025-07-22', userType: 'parent' },
      { id: 8, filename: 'Skärmbild 2025-07-22 023827.png', alt: 'Child testimonial about adventure stories', date: '2025-07-22', userType: 'child' },
      { id: 9, filename: 'Skärmbild 2025-07-22 023834.png', alt: 'Parent testimonial about bedtime stories', date: '2025-07-22', userType: 'parent' },
      { id: 10, filename: 'Skärmbild 2025-07-22 023840.png', alt: 'Educator testimonial about language development', date: '2025-07-22', userType: 'educator' },
      { id: 11, filename: 'Skärmbild 2025-07-22 023847.png', alt: 'Parent testimonial about customization', date: '2025-07-22', userType: 'parent' },
      { id: 12, filename: 'Skärmbild 2025-07-22 023851.png', alt: 'Child testimonial about character creation', date: '2025-07-22', userType: 'child' },
      { id: 13, filename: 'Skärmbild 2025-07-22 023916.png', alt: 'Parent testimonial about learning outcomes', date: '2025-07-22', userType: 'parent' },
      { id: 14, filename: 'Skärmbild 2025-07-22 023943.png', alt: 'Educator testimonial about student engagement', date: '2025-07-22', userType: 'educator' },
      { id: 15, filename: 'Skärmbild 2025-07-22 023951.png', alt: 'Parent testimonial about story variety', date: '2025-07-22', userType: 'parent' },
      { id: 16, filename: 'Skärmbild 2025-07-22 023955.png', alt: 'Child testimonial about magical adventures', date: '2025-07-22', userType: 'child' },
      { id: 17, filename: 'Skärmbild 2025-07-22 024057.png', alt: 'Parent testimonial about quality content', date: '2025-07-22', userType: 'parent' },
      { id: 18, filename: 'Skärmbild 2025-07-22 024103.png', alt: 'Educator testimonial about curriculum integration', date: '2025-07-22', userType: 'educator' },
      { id: 19, filename: 'Skärmbild 2025-07-22 024107.png', alt: 'Parent testimonial about creative process', date: '2025-07-22', userType: 'parent' },
      { id: 20, filename: 'Skärmbild 2025-07-22 024415.png', alt: 'Child testimonial about favorite characters', date: '2025-07-22', userType: 'child' },
      { id: 21, filename: 'Skärmbild 2025-07-22 024420.png', alt: 'Parent testimonial about educational games', date: '2025-07-22', userType: 'parent' },
      { id: 22, filename: 'Skärmbild 2025-07-22 031540.png', alt: 'Educator testimonial about storytelling techniques', date: '2025-07-22', userType: 'educator' },
      { id: 23, filename: 'Skärmbild 2025-07-22 031545.png', alt: 'Parent testimonial about child development', date: '2025-07-22', userType: 'parent' },
    ];

    setTestimonials(mockTestimonials);
    setFilteredTestimonials(mockTestimonials);
  }, []);

  // Apply filter when filter or testimonials change
  useEffect(() => {
    if (filter === 'all') {
      setFilteredTestimonials(testimonials);
    } else {
      setFilteredTestimonials(testimonials.filter(t => t.userType === filter));
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filter, testimonials]);

  // Pagination calculations
  const indexOfLastTestimonial = currentPage * testimonialsPerPage;
  const indexOfFirstTestimonial = indexOfLastTestimonial - testimonialsPerPage;
  const currentTestimonials = filteredTestimonials.slice(indexOfFirstTestimonial, indexOfLastTestimonial);
  const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle testimonial click for lightbox
  const handleTestimonialClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedTestimonial(null);
  };

  // Handle submission form
  const handleSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would submit to an API
    alert('Thank you for your testimonial! We will review it and add it to our collection.');
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="p-section text-center">
        <div className="container-lg">
          <div className="glass-card">
            <h1 className="title-hero mb-8">
              💬 What Our Users Say
            </h1>
            <p className="text-body text-xl max-w-4xl mx-auto mb-12 text-slate-200">
              Discover how Tale Forge is creating magical experiences for families, educators, and children around the world.
            </p>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                variant={filter === 'all' ? 'default' : 'secondary'} 
                onClick={() => setFilter('all')}
              >
                All Testimonials
              </Button>
              <Button 
                variant={filter === 'parent' ? 'default' : 'secondary'} 
                onClick={() => setFilter('parent')}
              >
                Parents
              </Button>
              <Button 
                variant={filter === 'educator' ? 'default' : 'secondary'} 
                onClick={() => setFilter('educator')}
              >
                Educators
              </Button>
              <Button 
                variant={filter === 'child' ? 'default' : 'secondary'} 
                onClick={() => setFilter('child')}
              >
                Children
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="p-section">
        <div className="container-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className="glass-card cursor-pointer hover:border-amber-400/40 transition-all duration-300 hover:scale-105 overflow-hidden"
                onClick={() => handleTestimonialClick(testimonial)}
              >
                <div className="relative pb-[100%]"> {/* Square container for image */}
                  <img 
                    src={`/images/testimonials/webp/${testimonial.filename.replace('.png', '.webp')}`} 
                    alt={testimonial.alt}
                    className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <p className="title-card-small mb-1">
                    {testimonial.userType.charAt(0).toUpperCase() + testimonial.userType.slice(1)}
                  </p>
                  <p className="text-body-xs text-slate-400">
                    {testimonial.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="p-section">
          <div className="container-lg">
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => paginate(i + 1)}
                    className="mx-1"
                  >
                    {i + 1}
                  </Button>
                ))}
                
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </section>
      )}

      {/* Submission Form */}
      <section className="p-section">
        <div className="container-lg">
          <div className="glass-card">
            <h2 className="title-section text-center mb-6">
              Share Your Experience
            </h2>
            <p className="text-body text-center mb-8 max-w-2xl mx-auto text-slate-200">
              We'd love to hear how Tale Forge has impacted your storytelling experience. Share your story with our community!
            </p>
            
            <form onSubmit={handleSubmission} className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="form-label">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="input-glass"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="input-glass"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="userType" className="form-label">
                  I am a...
                </label>
                <select
                  id="userType"
                  className="select-primary"
                >
                  <option value="parent">Parent</option>
                  <option value="educator">Educator</option>
                  <option value="child">Child</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label htmlFor="testimonial" className="form-label">
                  Your Testimonial
                </label>
                <textarea
                  id="testimonial"
                  rows={4}
                  className="textarea-primary"
                  placeholder="Tell us about your experience with Tale Forge..."
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label htmlFor="image" className="form-label">
                  Upload Screenshot (Optional)
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  className="input-glass"
                />
              </div>
              
              <div className="text-center">
                <Button variant="default" type="submit" size="lg">
                  Submit Testimonial
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={closeLightbox}>
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <Button 
              className="absolute top-2 right-2 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={closeLightbox}
              variant="ghost"
              size="icon"
            >
              &times;
            </Button>
            <img 
              src={`/images/testimonials/webp/${selectedTestimonial.filename.replace('.png', '.webp')}`} 
              alt={selectedTestimonial.alt}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
              <p className="title-card-small">
                {selectedTestimonial.alt}
              </p>
              <p className="text-body-sm mt-1">
                {selectedTestimonial.userType.charAt(0).toUpperCase() + selectedTestimonial.userType.slice(1)} • {selectedTestimonial.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsPage;