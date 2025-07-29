import React from 'react';

const Services: React.FC = () => {
  return (
    <section 
      className="relative py-16 lg:py-24 bg-white"
    >
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Mes Services Premium
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Des créations magiques pour célébrer vos moments les plus précieux
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Anniversaires',
                description: 'Des décorations féeriques pour faire briller les yeux de vos enfants',
                icon: '🎂'
              },
              {
                title: 'Baby Showers',
                description: 'Célébrez l\'arrivée de votre petit ange avec style et élégance',
                icon: '👶'
              },
              {
                title: 'Baptêmes',
                description: 'Des ambiances douces et spirituelles pour ce moment sacré',
                icon: '🕊️'
              }
            ].map((service, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-12">
            <button className="bg-gradient-to-r from-pink-500 to-yellow-500 text-white px-8 py-4 rounded-full font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              Découvrir toutes mes créations
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
