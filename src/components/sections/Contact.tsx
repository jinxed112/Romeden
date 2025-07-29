import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Instagram, Facebook, Music2, Mail, Phone, MapPin } from 'lucide-react';
import { useContactSettings } from '../../hooks/useContactSettings';

gsap.registerPlugin(ScrollTrigger);

interface ContactForm {
  nom: string;
  email: string;
  telephone: string;
  sujet: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    nom: '',
    email: '',
    telephone: '',
    sujet: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  // ✅ NOUVEAU: Utiliser les settings configurables
  const contactSettings = useContactSettings();

  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const form = formRef.current;
    const info = infoRef.current;

    if (!section || !form || !info) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.fromTo(info, 
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }
    );

    tl.fromTo(form, 
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' },
      '-=0.4'
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
      });
      
      setTimeout(() => setShowSuccess(false), 5000);
    }, 2000);
  };

  const sujets = [
    { value: '', label: 'Choisir un sujet' },
    { value: 'information', label: '💬 Demande d\'information' },
    { value: 'rdv', label: '📅 Prise de rendez-vous' },
    { value: 'partenariat', label: '🤝 Partenariat' },
    { value: 'autre', label: '✨ Autre' }
  ];

  // ✅ FONCTION: Gérer les clics sur réseaux sociaux
  const handleSocialClick = (url: string) => {
    if (url && url.trim() !== '') {
      window.open(url, '_blank');
    }
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-neutral-50 to-amber-50/30 relative overflow-hidden"
    >
      {/* Particules flottantes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400/30 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-pink-400/40 rounded-full animate-pulse"></div>
        <div className="absolute bottom-40 left-1/4 w-1.5 h-1.5 bg-purple-400/30 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-amber-500/40 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Titre principal */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-light text-slate-700 mb-4">
            Contactez-moi
          </h2>
          <div 
            className="text-3xl lg:text-4xl text-amber-600 mb-6"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontStyle: 'italic',
              fontWeight: '400'
            }}
          >
            Échangeons sur votre projet
          </div>
          <div className="w-16 h-px bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mb-6"></div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Une question ? Un projet en tête ? N'hésitez pas à me contacter pour discuter 
            de vos envies et créer ensemble quelque chose de magique.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20">
          
          {/* Informations de contact */}
          <div ref={infoRef} className="space-y-8">
            
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-slate-800 mb-6">
                Parlons de votre projet
              </h3>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                Chaque événement est unique et mérite une attention particulière. 
                Contactez-moi pour échanger sur vos envies et vos inspirations.
              </p>

              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">💡</span>
                  <h4 className="font-semibold text-slate-800">Simulateur de devis</h4>
                </div>
                <p className="text-slate-600 mb-4">
                  Estimez rapidement le budget de votre événement avec notre simulateur en ligne.
                </p>
                <button
                  onClick={() => navigate("/devis")}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Accéder au simulateur
                </button>
              </div>
            </div>

            {/* ✅ NOUVEAU: Moyens de contact dynamiques */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Email</div>
                  <div className="text-slate-600">{contactSettings.email}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Téléphone</div>
                  <div className="text-slate-600">{contactSettings.telephone}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-slate-800">Zone d'intervention</div>
                  <div className="text-slate-600">{contactSettings.zoneIntervention}</div>
                </div>
              </div>
            </div>

            {/* ✅ NOUVEAU: Réseaux sociaux avec vraies icônes */}
            <div className="pt-6 border-t border-slate-200">
              <div className="text-sm font-medium text-slate-800 mb-4">Suivez mes créations</div>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleSocialClick(contactSettings.reseauxSociaux.instagram)}
                  className={`w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    contactSettings.reseauxSociaux.instagram 
                      ? 'hover:scale-110 cursor-pointer hover:shadow-lg' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!contactSettings.reseauxSociaux.instagram}
                >
                  <Instagram className="w-5 h-5 text-rose-500" />
                </button>
                
                <button
                  onClick={() => handleSocialClick(contactSettings.reseauxSociaux.facebook)}
                  className={`w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    contactSettings.reseauxSociaux.facebook 
                      ? 'hover:scale-110 cursor-pointer hover:shadow-lg' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!contactSettings.reseauxSociaux.facebook}
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                </button>
                
                <button
                  onClick={() => handleSocialClick(contactSettings.reseauxSociaux.tiktok)}
                  className={`w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    contactSettings.reseauxSociaux.tiktok 
                      ? 'hover:scale-110 cursor-pointer hover:shadow-lg' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  disabled={!contactSettings.reseauxSociaux.tiktok}
                >
                  <Music2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Formulaire de contact simple */}
          <div ref={formRef}>
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 border border-slate-100">
              
              <h3 className="text-2xl font-semibold text-slate-800 mb-6">
                Envoyez-moi un message
              </h3>

              {showSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <div className="font-medium text-green-800">Message envoyé !</div>
                      <div className="text-sm text-green-600">Je vous recontacterai dans les plus brefs délais.</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Nom et Email */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="votre@email.fr"
                    />
                  </div>
                </div>

                {/* Téléphone et Sujet */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                      placeholder="06 XX XX XX XX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Sujet *
                    </label>
                    <select
                      name="sujet"
                      value={formData.sujet}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    >
                      {sujets.map(sujet => (
                        <option key={sujet.value} value={sujet.value}>
                          {sujet.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Votre message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Décrivez-moi votre projet, vos questions ou vos idées..."
                  />
                </div>

                {/* Bouton submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 focus:ring-4 focus:ring-amber-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    'Envoyer le message'
                  )}
                </button>

                <p className="text-xs text-slate-500 text-center">
                  * Champs obligatoires. Vos données sont protégées et ne seront jamais partagées.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;