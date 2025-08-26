import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthContext';
import Button from '@/components/atoms/Button';
import Icon from '@/components/atoms/Icon';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const featuredStories = [
    {
      title: "Magical Space Adventure",
      description: "Join friendly astronauts on a cosmic journey through the stars",
      image: "/images/genres/adventure/futuristic-space-adventure.png",
      genre: "Adventure",
    },
    {
      title: "Enchanted Forest Tales",
      description: "Discover magical creatures in mystical woodland realms",
      image: "/images/genres/fantasy/enchanted-world.png", 
      genre: "Fantasy",
    },
    {
      title: "Bedtime Moon Stories",
      description: "Gentle tales for peaceful dreams under starlit skies",
      image: "/images/genres/bedtime/peaceful-bedtime.png",
      genre: "Bedtime",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Refined Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-amber-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-amber-500/25 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-amber-300/15 rounded-full animate-pulse delay-2000"></div>
        <div className="absolute top-1/3 right-2/3 w-1 h-1 bg-amber-600/20 rounded-full animate-pulse delay-3000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex items-center justify-center py-16 md:py-20 lg:py-24">
        <div className="container-lg text-center">
          {/* Hero Container */}
          <div className="glass-card rounded-2xl p-8 md:p-12 lg:p-16">
            {/* Main Title */}
            <h1 className="title-hero mb-8 text-center">
              TALE FORGE
            </h1>

            {/* Subtitle */}
            <h2 className="title-section mb-8 sm:mb-12 text-center text-amber-400">
              CREATE MAGICAL STORIES<br />
              TOGETHER!
            </h2>

            {/* Description */}
            <p className="text-body text-lg sm:text-xl md:text-2xl max-w-4xl mx-auto leading-relaxed mb-12 sm:mb-16 text-center">
              Transform your ideas into enchanting stories with AI-powered creativity.
              Perfect for families, educators, and storytellers of all ages!
            </p>

            {/* CTA Buttons - Context Aware */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-8">
              {user ? (
                <>
                  <Link to="/create">
                    <Button variant="primary" size="large" className="flex items-center space-x-2">
                      <Icon name="plus" size={20} />
                      <span>Create New Story</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="secondary" size="large" className="flex items-center space-x-2">
                      <Icon name="user" size={20} />
                      <span>Go to Dashboard</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup">
                    <Button variant="primary" size="large" className="flex items-center space-x-2">
                      <Icon name="plus" size={20} />
                      <span>Start Creating Stories</span>
                    </Button>
                  </Link>
                  <Link to="/features">
                    <Button variant="secondary" size="large" className="flex items-center space-x-2">
                      <Icon name="star" size={20} />
                      <span>Learn More</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="glass-card rounded-lg p-6">
                <div className="text-amber-400 mb-4">
                  <Icon name="star" size={32} />
                </div>
                <h3 className="title-card mb-2">AI-Powered</h3>
                <p className="text-body">Stories crafted with advanced AI that adapts to your child's interests</p>
              </div>
              <div className="glass-card rounded-lg p-6">
                <div className="text-amber-400 mb-4">
                  <Icon name="user" size={32} />
                </div>
                <h3 className="title-card mb-2">Interactive</h3>
                <p className="text-body">Children make choices that shape the story's direction and outcome</p>
              </div>
              <div className="glass-card rounded-lg p-6">
                <div className="text-amber-400 mb-4">
                  <Icon name="book" size={32} />
                </div>
                <h3 className="title-card mb-2">Educational</h3>
                <p className="text-body">Stories designed to teach values and spark imagination</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Stories Section */}
      <section className="relative z-10 py-16 md:py-20 lg:py-24">
        <div className="container-lg">
          <div className="glass rounded-2xl p-8 md:p-12">
            <h2 className="title-section text-center mb-12 text-amber-400">
              Featured Story Adventures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredStories.map((story, index) => (
                <div key={index} className="glass-card rounded-lg overflow-hidden hover:transform hover:scale-105  transition-all duration-300 group">
                  <div className="relative">
                    <img 
                      src={story.image} 
                      alt={story.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.nextElementSibling) {
                          (target.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden w-full h-48 bg-gradient-to-br from-purple-900/50 to-blue-900/50 items-center justify-center">
                      <Icon name="book" size={64} className="text-amber-400/50" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-2">
                      {story.genre}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Call to Action */}
            <div className="text-center mt-12">
              {!user && (
                <Link to="/signup">
                  <button className="btn btn-primary btn-lg">
                    Join the Adventure Today!
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;