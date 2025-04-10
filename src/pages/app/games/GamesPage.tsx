
import React from 'react';
import { AmbientSoundPlayer } from '@/components/audio/AmbientSoundPlayer';

const GamesPage: React.FC = () => {
  console.log('GamesPage component rendering');
  
  const ambientSounds = [
    { name: "Cafe Ambience", src: "/sounds/cafe.mp3" },
    { name: "Rainfall", src: "/sounds/rain.mp3" },
    { name: "Forest Sounds", src: "/sounds/forest.mp3" },
    { name: "White Noise", src: "/sounds/white-noise.mp3" },
    { name: "Pink Noise", src: "/sounds/pink-noise.mp3" },
    { name: "Brown Noise", src: "/sounds/brown-noise.mp3" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">Focus Sounds</h1>
      
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Ambient Sounds</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ambientSounds.map((sound) => (
            <AmbientSoundPlayer 
              key={sound.name}
              name={sound.name}
              soundSrc={sound.src}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default GamesPage;
