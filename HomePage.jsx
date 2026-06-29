import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Palette, Users, Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header.jsx';

const HomePage = () => {
  const features = [
    {
      icon: Palette,
      title: 'Collaborative Canvas',
      description: 'Place pixels on a shared 100x100 grid. Every pixel tells a story.',
    },
    {
      icon: Users,
      title: 'Real-Time Updates',
      description: 'Watch the canvas evolve as players worldwide contribute their pixels.',
    },
    {
      icon: Coins,
      title: 'Pixel Economy',
      description: 'Earn pixels by watching ads or purchase them to expand your creative power.',
    },
    {
      icon: Zap,
      title: 'Weekly Resets',
      description: 'Fresh canvas every week. New opportunities to create collaborative art.',
    },
  ];

  return (
    <>
      <Helmet>
        <title>PixelWar - Collaborative Pixel Art Canvas</title>
        <meta name="description" content="Join thousands of players in creating collaborative pixel art. Place pixels, earn rewards, and watch the canvas evolve in real-time." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1697893156187-8598ba865712"
              alt="Pixel art background"
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 leading-tight" style={{ letterSpacing: '-0.02em', textWrap: 'balance' }}>
                PixelWar
              </h1>
              <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join the ultimate collaborative pixel art experience. Place pixels, earn rewards, and create art with thousands of players worldwide.
              </p>
              <Link to="/canvas">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 transition-all duration-200 active:scale-[0.98]">
                  Play Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-20 bg-secondary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center leading-snug"
              style={{ textWrap: 'balance' }}
            >
              How it works
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-foreground/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t-2 border-border bg-card py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-card-foreground">
                © 2026 PixelWar. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link to="/login" className="text-sm text-card-foreground hover:text-foreground transition-all duration-200">
                  Login
                </Link>
                <span className="text-sm text-card-foreground">Privacy Policy</span>
                <span className="text-sm text-card-foreground">Terms of Service</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;
