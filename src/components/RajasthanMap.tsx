import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  MapPin, 
  Info, 
  History as HistoryIcon, 
  BookOpen, 
  ChevronRight,
  Navigation,
  Trophy
} from 'lucide-react';

// Custom Marker styling
const createCustomIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${isSelected ? `
          <div class="absolute w-12 h-12 bg-indigo-500/30 rounded-full animate-pulse blur-sm"></div>
          <div class="absolute w-8 h-8 bg-indigo-500/20 rounded-full animate-ping opacity-20"></div>
        ` : ''}
        <div class="relative w-8 h-8 ${isSelected ? 'bg-indigo-600 scale-110' : 'bg-white'} border-2 border-indigo-600 rounded-lg shadow-lg flex items-center justify-center transition-all duration-700">
          <div class="w-2 h-2 ${isSelected ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-indigo-600'} rounded-full transition-all duration-500"></div>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
};

interface Landmark {
  id: string;
  name: string;
  type: 'HISTORICAL' | 'GEOGRAPHICAL' | 'ADMIN';
  lat: number;
  lng: number;
  facts: string[];
  syllabusPoint: string;
  description: string;
  examFrequency: 'High' | 'Medium' | 'Low';
}

const landmarks: Landmark[] = [
  {
    id: 'chittorgarh',
    name: 'Chittorgarh Fort',
    type: 'HISTORICAL',
    lat: 24.8887,
    lng: 74.6467,
    description: 'The largest fort in India and the grandest in Rajasthan.',
    facts: [
      'Site of three major sieges (1303, 1535, 1567).',
      'Contains Vijay Stambha (Tower of Victory) built by Rana Kumbha.',
      'Known for the Jauhar of Rani Padmini.'
    ],
    syllabusPoint: 'Rajasthan History: Medieval Forts & Architecture',
    examFrequency: 'High'
  },
  {
    id: 'mount-abu',
    name: 'Guru Shikhar (Mt. Abu)',
    type: 'GEOGRAPHICAL',
    lat: 24.6394,
    lng: 72.7758,
    description: 'Highest peak of the Aravalli Range (1,722m).',
    facts: [
      'Part of the oldest fold mountain range in the world.',
      'Home to the famous Dilwara Jain Temples.',
      'Only hill station in Rajasthan.'
    ],
    syllabusPoint: 'Geography: Physical Features of Rajasthan',
    examFrequency: 'High'
  },
  {
    id: 'sambhar-lake',
    name: 'Sambhar Salt Lake',
    type: 'GEOGRAPHICAL',
    lat: 26.9600,
    lng: 75.0500,
    description: "India's largest inland salt lake.",
    facts: [
      'Produced 1.96 lakh tonnes of salt annually.',
      'Designated as a Ramsar site (wetland of international importance).',
      'Mentioned in the Mahabharata as part of the kingdom of king Brishparva.'
    ],
    syllabusPoint: 'Geography: Drainage System & Lakes',
    examFrequency: 'Medium'
  },
  {
    id: 'rpsc-ajmer',
    name: 'RPSC HQ (Ajmer)',
    type: 'ADMIN',
    lat: 26.4499,
    lng: 74.6399,
    description: 'Headquarters of the Rajasthan Public Service Commission.',
    facts: [
      'Established on August 16, 1949.',
      'Ajmer is known as the "Heart of Rajasthan".',
      'Location of the Dargah of Moinuddin Chishti.'
    ],
    syllabusPoint: 'Polity: Constitutional Bodies of Rajasthan',
    examFrequency: 'High'
  },
  {
    id: 'keoladeo',
    name: 'Keoladeo National Park',
    type: 'GEOGRAPHICAL',
    lat: 27.1592,
    lng: 77.5255,
    description: 'Formerly known as Bharatpur Bird Sanctuary.',
    facts: [
      'UNESCO World Heritage Site.',
      'Famous for the Siberian Crane (migratory bird).',
      'Man-made and man-managed wetland.'
    ],
    syllabusPoint: 'Environment: Flora and Fauna of Rajasthan',
    examFrequency: 'High'
  }
];

export default function RajasthanMap({ onClose }: { onClose: () => void }) {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-0 md:p-4 lg:p-6"
    >
      <div className="w-full h-full max-w-7xl bg-white md:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
        {/* Close Button - More prominent for mobile */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[210] p-3 md:p-2 bg-white/90 backdrop-blur-md rounded-full shadow-xl hover:bg-white transition-all active:scale-95 flex items-center justify-center border border-slate-100"
        >
          <X size={24} className="md:size-5 text-slate-800" />
        </button>

        {/* Map Section */}
        <div className="flex-1 h-[45vh] xs:h-[50vh] md:h-full relative border-r border-slate-100">
          <MapContainer 
            center={[26.5, 74.5]} 
            zoom={7} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            
            {landmarks.map((landmark) => (
              <Marker
                key={landmark.id}
                position={[landmark.lat, landmark.lng]}
                icon={createCustomIcon(selectedLandmark?.id === landmark.id)}
                eventHandlers={{
                  click: () => setSelectedLandmark(landmark),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 font-sans">
                    <h4 className="font-bold text-slate-800 text-sm">{landmark.name}</h4>
                    <button 
                      onClick={() => setSelectedLandmark(landmark)}
                      className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1"
                    >
                      View Facts <ChevronRight size={10} />
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            <ScaleControl position="bottomleft" />
            <ZoomControl position="bottomright" />
          </MapContainer>
          
          {/* Header overlay for mobile */}
          <div className="absolute top-4 left-4 z-[205] md:hidden">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Navigation size={14} className="text-indigo-600" />
                GK Explorer
              </h2>
            </div>
          </div>
        </div>

        {/* Info Sidebar / Detail Panel */}
        <div className="flex-1 md:w-96 p-4 md:p-6 flex flex-col bg-slate-50 overflow-y-auto">
          <div className="hidden md:block mb-6">
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2 font-display">
              <Navigation className="text-indigo-600" />
              GK Explorer
            </h2>
            <p className="text-sm text-slate-500 mt-1">Interactive Landmarks of Rajasthan</p>
          </div>

          <AnimatePresence mode="wait">
            {selectedLandmark ? (
              <motion.div
                key={selectedLandmark.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4 md:space-y-6 pb-8 md:pb-0"
              >
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-widest">
                      {selectedLandmark.type}
                    </span>
                    <div className="flex items-center gap-1">
                      <Trophy size={10} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-slate-400">Exam Frequency: <span className="text-amber-600">{selectedLandmark.examFrequency}</span></span>
                    </div>
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-800 font-display">{selectedLandmark.name}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {selectedLandmark.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BookOpen size={12} /> Syllabus Relevance
                  </h4>
                  <div className="bg-indigo-600/5 border border-indigo-100 p-4 rounded-2xl">
                    <p className="text-sm font-bold text-indigo-900">{selectedLandmark.syllabusPoint}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <HistoryIcon size={12} /> Key Historical Facts
                  </h4>
                  <div className="space-y-2">
                    {selectedLandmark.facts.map((fact, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform hover:translate-x-1">
                        <div className="w-5 h-5 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-full flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{fact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: Explicit button to clear selection and focus on map */}
                <button 
                  onClick={() => setSelectedLandmark(null)}
                  className="md:hidden w-full py-3 bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
                >
                  Back to All Landmarks
                </button>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-10">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-200/50 rounded-full flex items-center justify-center mb-4">
                  <MapPin size={32} className="text-slate-400" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-700">Select a Location</h3>
                <p className="text-[11px] md:text-xs mt-2 text-slate-500 max-w-[200px]">
                  Tap any marker on the map to see important facts and syllabus details.
                </p>
                <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-[240px]">
                  {landmarks.slice(0, 3).map(l => (
                    <button 
                      key={l.id}
                      onClick={() => setSelectedLandmark(l)}
                      className="p-3 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 text-left hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center justify-between group"
                    >
                      {l.name}
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
