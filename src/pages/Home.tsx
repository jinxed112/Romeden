import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import Services from '../components/sections/Services';
import About from '../components/sections/About';
import Gallery from '../components/sections/Gallery';
import Contact from '../components/sections/Contact';
import Footer from '../components/layout/Footer';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Sections avec ID pour la navigation */}
      <div id="accueil">
        <Hero />
      </div>
      
      <div id="services">
        <Services />
      </div>
      
      <div id="apropos">
        <About />
      </div>
      
      <div id="galerie">
        <Gallery />
      </div>
      
      <div id="contact">
        <Contact />
      </div>
      
      <Footer />
    </div>
  );
};

export default Home;
