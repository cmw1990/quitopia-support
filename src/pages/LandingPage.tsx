import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                A Fresh Start For Your <span className="text-primary">Smoke-Free Journey</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Comprehensive support for your path to a healthier, fresher life. Whether you're quitting cold turkey or taking gradual steps, Mission Fresh is your companion every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <Button size="lg" className="w-full sm:w-auto">Get Started</Button>
                </Link>
                <Link to="/web-tools/nrt-directory">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Explore Smokeless Products</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src="/images/hero-app.webp" 
                  alt="Mission Fresh App" 
                  className="w-full rounded-2xl" 
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400/10b981/ffffff?text=Mission+Fresh";
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <img className="h-8 w-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/44.jpg" alt="User" />
                    <img className="h-8 w-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
                    <img className="h-8 w-8 rounded-full border-2 border-white" src="https://randomuser.me/api/portraits/women/68.jpg" alt="User" />
                  </div>
                  <span className="text-sm font-medium">Join 10,000+ members</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need To Stay Fresh</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mission Fresh offers a holistic approach to quitting, with tools that support not just stopping nicotine, but addressing energy, mood, focus, and overall wellbeing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Tracking</h3>
              <p className="text-gray-600">
                Track your progress with customized goals based on your preferred quit method, whether it's cold turkey, gradual reduction, or NRT.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Energy Support</h3>
              <p className="text-gray-600">
                Combat fatigue and energy dips during nicotine withdrawal with specialized tools, exercises, and guidance.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Focus Enhancement</h3>
              <p className="text-gray-600">
                Stay sharp and maintain concentration with techniques designed specifically for those experiencing nicotine withdrawal.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mood Support</h3>
              <p className="text-gray-600">
                Techniques and exercises to help manage the mood fluctuations that often accompany quitting nicotine.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Support</h3>
              <p className="text-gray-600">
                Connect with others on similar journeys, share experiences, and gain motivation from success stories.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Health Improvements</h3>
              <p className="text-gray-600">
                Visualize the positive changes happening in your body as you reduce nicotine, from improved circulation to better lung function.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Highlight */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Comprehensive Smokeless Products Directory</h2>
              <p className="text-xl text-gray-600 mb-6">
                Explore the world's most comprehensive directory of smokeless nicotine products, with detailed reviews, ratings, and health information.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Detailed product information and specifications</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>User reviews and expert ratings</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Health concerns and benefits highlighted</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-primary mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Country-specific availability and regulations</span>
                </li>
              </ul>
              <Link to="/web-tools/nrt-directory">
                <Button size="lg">Explore Directory</Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src="/images/products-directory.webp" 
                alt="Smokeless Products Directory" 
                className="rounded-xl shadow-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/600x400/60a5fa/ffffff?text=Products+Directory";
                }}
              />
              <div className="absolute -top-4 -right-4 bg-primary text-white py-2 px-4 rounded-lg shadow-lg rotate-3">
                <span className="font-bold">400+ Products</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 px-4 text-white">
        <div className="container mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Fresh Journey?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands who have successfully reduced or eliminated nicotine with Mission Fresh's comprehensive approach.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">Create Free Account</Button>
            </Link>
            <Link to="/web-tools/nrt-directory">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto">
                Browse Smokeless Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage; 