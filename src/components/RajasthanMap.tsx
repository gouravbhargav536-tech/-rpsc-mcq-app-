import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ScaleControl, ZoomControl, Polyline } from 'react-leaflet';
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
  Trophy,
  Compass,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Footprints,
  Waves
} from 'lucide-react';

// Custom Marker styling corresponding to categories
const getMarkerHtml = (category: string, isSelected: boolean, name: string) => {
  let emoji = '📍';
  let bgColor = 'bg-white';
  let borderCol = 'border-indigo-600 animate-pulse';
  
  switch(category) {
    case 'temples':
      emoji = '🛕';
      bgColor = 'bg-amber-50';
      borderCol = 'border-amber-600';
      break;
    case 'forts':
      emoji = '🏰';
      bgColor = 'bg-slate-50';
      borderCol = 'border-slate-700';
      break;
    case 'lakes':
      emoji = '💧';
      bgColor = 'bg-blue-50';
      borderCol = 'border-blue-600';
      break;
    case 'wildlife':
      emoji = '🐅';
      bgColor = 'bg-emerald-50';
      borderCol = 'border-emerald-600';
      break;
    case 'culture':
      emoji = '🎨';
      bgColor = 'bg-purple-50';
      borderCol = 'border-purple-600';
      break;
    case 'geography':
      emoji = '⛰️';
      bgColor = 'bg-amber-100';
      borderCol = 'border-amber-900';
      break;
  }

  return L.divIcon({
    className: 'custom-atlas-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${isSelected ? `
          <div class="absolute w-14 h-14 bg-indigo-500/30 rounded-full animate-ping blur-sm"></div>
          <div class="absolute w-10 h-10 bg-indigo-500/20 rounded-full animate-pulse opacity-40"></div>
        ` : ''}
        <div class="relative w-9 h-9 ${isSelected ? 'scale-115 shadow-2xl ring-2 ring-indigo-400' : 'shadow-md'} ${bgColor} border-2 ${borderCol} rounded-xl flex items-center justify-center transition-all duration-300">
          <span class="text-lg">${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

interface LocationItem {
  id: string;
  name: string;
  category: 'temples' | 'rivers' | 'culture' | 'geography' | 'forts' | 'lakes' | 'wildlife';
  lat?: number;
  lng?: number;
  path?: [number, number][];
  color?: string;
  origin?: string;
  length?: string;
  tributaries?: string[];
  district: string;
  description: string;
  history: string;
  culturalImportance: string;
  famousFestival: string;
  image: string;
  govTourismLink?: string;
}

const rajasthanAtlasData: LocationItem[] = [
  // Temples
  {
    id: 'temple-karni',
    name: 'Karni Mata Temple',
    category: 'temples',
    lat: 27.7909,
    lng: 73.3409,
    district: 'Bikaner (Deshnoke)',
    description: 'World-famous temple dedicated to Karni Mata, inhabited by thousands of sacred black rats (Kabas) revered by devotees.',
    history: 'Built in the 15th-20th century under Maharaja Ganga Singh of Bikaner. Constructed of magnificent white marble with heavily carved solid silver gates gifted by the Royal family.',
    culturalImportance: 'Devotees believe that the Kabas are re-incarnations of Karni Mata and her Charan clansmen. Spotting a white rat is considered extremely lucky.',
    famousFestival: 'Karni Mata Fair (held twice a year during Navratras in Ashvin and Chaitra)',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Karni+Mata+Temple+Deshnok+Bikaner'
  },
  {
    id: 'temple-dilwara',
    name: 'Dilwara Jain Temples',
    category: 'temples',
    lat: 24.6062,
    lng: 72.7237,
    district: 'Sirohi (Mount Abu)',
    description: 'A group of five extraordinary, intricately carved marble temples built of flawless white Makrana marble amongst lush hills.',
    history: 'Constructed between the 11th and 13th centuries by Vimal Shah and Vastupal-Tejpal. Renowned as a peak masterpiece of medieval stone craft.',
    culturalImportance: 'An invaluable pilgrimage site for Shvetambara Jains, housing five specific sanctuaries: Vimal Vasahi, Luna Vasahi, Pithalhar, Parshvanatha, and Mahavir Swami.',
    famousFestival: 'Mahavir Jayanti & Ashtanika Parva',
    image: 'https://images.unsplash.com/photo-1621360841013-c7683c659ec6?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Dilwara+Temples+Mount+Abu'
  },
  {
    id: 'temple-brahma',
    name: 'Jagatpita Brahma Temple',
    category: 'temples',
    lat: 26.4891,
    lng: 74.5505,
    district: 'Ajmer (Pushkar)',
    description: 'One of the exceptionally rare existing temples in the world dedicated to Lord Brahma, situated close to the sacred Pushkar Lake.',
    history: 'Although the current structure dates back to the 14th century, the original sanctuary is said to have been consecrated by Sage Vishwamitra 2,000 years ago.',
    culturalImportance: 'Pilgrims bathe in Pushkar Lake before proposing prayers at this temple. Symbolizes creation in Hindu trinity theology.',
    famousFestival: 'Pushkar Camel Fair & Kartik Poornima',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Brahma+Temple+Pushkar'
  },
  {
    id: 'temple-shrinathji',
    name: 'Shrinathji Temple',
    category: 'temples',
    lat: 24.9328,
    lng: 73.8189,
    district: 'Rajsamand (Nathdwara)',
    description: 'A prestigious temple dedicated to Shrinathji—the infant form of Lord Krishna lifting the Govardhan hill.',
    history: 'The deity was brought from Govardhan near Vrindavan in 1669 to protect it from destruction and was installed at Nathdwara under of Mewar ruler Maharaja Raj Singh.',
    culturalImportance: 'Principle shrine of the Pushtimarg sect. Famous for spectacular Pichwai paintings and delicate daily Shringar darshans.',
    famousFestival: 'Krishna Janmashtami & Annakutta',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a406657?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Shrinathji+Temple+Nathdwara'
  },
  // Rivers
  {
    id: 'river-chambal',
    name: 'Chambal River',
    category: 'rivers',
    path: [[24.0, 75.8], [24.5, 75.6], [24.9, 75.5], [25.1, 75.8], [25.2, 75.9], [25.3, 76.2], [25.7, 76.5], [26.0, 76.8], [26.3, 77.1], [26.6, 77.4], [26.7, 77.8], [26.8, 78.1]],
    color: '#06b6d4',
    origin: 'Janapav Hills, Vindhya Range (MP)',
    length: '1,024 km (approx. 376 km in Rajasthan)',
    tributaries: ['Banas', 'Kalisindh', 'Parbati', 'Mej', 'Alnia'],
    district: 'Kota, Dholpur, Sawai Madhopur',
    description: 'The sole perennial, legendary river in Rajasthan. Famous for its pristine deep gorges, ravines, and rich biological reserve protected by the National Chambal Sanctuary.',
    history: 'A clean and pollution-free river, historically spared from urban expansion due to local cultural myths of curse. Home of the endangered Gangetic River Dolphin and Gharials.',
    culturalImportance: 'Mentioned as Charmanvati in ancient Puranic literatures; revered as a symbol of pure, unpolluted nature.',
    famousFestival: 'World Water Alliance Awareness Drives & Dev Darshan Aarti at Kota Barrage',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Chambal+River+Kota'
  },
  {
    id: 'river-banas',
    name: 'Banas River',
    category: 'rivers',
    path: [[25.0, 73.7], [25.2, 74.2], [25.3, 74.6], [25.5, 74.9], [25.7, 75.3], [25.9, 75.7], [25.9, 76.1], [25.8, 76.5]],
    color: '#f43f5e',
    origin: 'Khamnor Hills, Aravalli Range (Rajsamand)',
    length: '512 km (flows entirely within Rajasthan)',
    tributaries: ['Berach', 'Kothari', 'Khari', 'Dai', 'Monal', 'Sodra'],
    district: 'Rajsamand, Chittorgarh, Bhilwara, Tonk, Sawai Madhopur',
    description: 'Popularly known as the "Van Ki Asha" (Hope of the Forest). Seasonal river that joins Chambal at Rameshwaram pilgrimage point.',
    history: 'Serves as critical irrigation and water baseline reservoir. Feeds the premium Bisalpur Dam built across it in Tonk district supplying water to Jaipur and Ajmer.',
    culturalImportance: 'The Triveni Sangam (confluence of Banas, Monal, and Berach) at Bhilwara is a sacred ancient cremation and ritual bathing site.',
    famousFestival: 'Triveni Baneshwar Fair rituals & Solar Pooja',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Banas+River+Bisalpur+Dam'
  },
  {
    id: 'river-luni',
    name: 'Luni River (Lavanavari)',
    category: 'rivers',
    path: [[26.50, 74.60], [26.25, 73.90], [26.10, 73.20], [25.90, 72.50], [25.60, 71.80], [25.10, 71.30], [24.70, 71.0]],
    color: '#fbbf24',
    origin: 'Naga Hills, Ajmer (Sargamati & Saraswati meeting point)',
    length: '495 km (drains into the Rann of Kutch)',
    tributaries: ['Jawai', 'Sukri', 'Mithri', 'Bandi', 'Sagi', 'Guhiya'],
    district: 'Ajmer, Pali, Jodhpur, Barmer, Jalore',
    description: 'The sole desert river basin of Western Rajasthan. Famous for its peculiar nature: sweet water up to Balotra, turning highly saline downstream due to saline-heavy desert sands.',
    history: 'In ancient history, described by Sage Kalidasa as "Antahsalila" (Laying hidden under sand columns). Handled water supply for the entire Marwar region.',
    culturalImportance: 'A critical pillar in RPSC physical geography, Luni basin supports unique traditional desert agriculture and ancient civilizations.',
    famousFestival: 'Historic Tilwara Desert Cattle Fair on riverbeds of Barmer',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Luni+River+Balotra'
  },
  // Forts
  {
    id: 'fort-chittor',
    name: 'Chittorgarh Fort',
    category: 'forts',
    lat: 24.8887,
    lng: 74.6467,
    district: 'Chittorgarh',
    description: 'A colossal bastion sprawled across a 180-metre high hill, representing the epitome of Rajput pride, architectural brilliance, and sacrifice.',
    history: 'Constructed by Chitrangada Mori in the 7th century. Remained the historic capital of Mewar rulers. Stands witness to the courage of Rana Sanga and Maharana Tripta.',
    culturalImportance: 'UNESCO World Heritage Site. Home to the legendary Meera Bai temple, Gaumukh Reservoir, Vijay Stambha, and Kirti Stambha.',
    famousFestival: 'Jauhar Mela commemorating Mewar warrior spirits',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a406657?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Chittorgarh+Fort'
  },
  {
    id: 'fort-mehrangarh',
    name: 'Mehrangarh Fort',
    category: 'forts',
    lat: 26.2978,
    lng: 73.0189,
    district: 'Jodhpur',
    description: 'One of the largest, best-preserved forts in India. Rising 122 metres above the Blue City skyline, its battlements appear carved from the cliff itself.',
    history: 'Founded in 1459 by Rao Jodha, Chief of the Rathore clan. Renowned for its heavy artistic galleries, historic cannons, and invincible giant walls.',
    culturalImportance: 'Houses Chamunda Mata Temple (revered protector of Marwar) and a fine royal museum boasting historic elephant howdahs and medieval weapons.',
    famousFestival: 'Rajasthan International Folk Festival (RIFF) in October',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Mehrangarh+Fort+Jodhpur'
  },
  {
    id: 'fort-kumbhalgarh',
    name: 'Kumbhalgarh Fort',
    category: 'forts',
    lat: 25.1484,
    lng: 73.5872,
    district: 'Rajsamand',
    description: 'A glorious mountain bastion famous for having the "Great Wall of India"—the second-longest continuous wall in the world, stretching over 36 km.',
    history: 'Built in the 15th century by Rana Kumbha. Birthplace of the legendary warrior King Mewar Maharana Pratap. Never captured in direct warfare.',
    culturalImportance: 'Contains Badal Mahal, and over 360 ancient Hindu and Jain temples. Epitomizes military architecture of RPSC historical studies.',
    famousFestival: 'Kumbhalgarh Festival (Art, Music & Dance carnival by Tourism Dept)',
    image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Kumbhalgarh+Fort'
  },
  // Lakes
  {
    id: 'lake-pichola',
    name: 'Lake Pichola',
    category: 'lakes',
    lat: 24.5714,
    lng: 73.6791,
    district: 'Udaipur',
    description: 'An picturesque artificial freshwater lake created in the heart of Udaipur city, containing the iconic Lake Palace on Jag Niwas island.',
    history: 'Constructed in 1362 AD by a gypsy banjara tribesman during the reign of Maharana Lakha; later widened by Maharana Udai Singh.',
    culturalImportance: 'Reflects the architectural splendor of City Palace on its banks. Hub of Rajasthani romantic poetry and modern luxury.',
    famousFestival: 'Mewar Festival & Gangaur Pujas on Pichola' ,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Lake+Pichola+Udaipur'
  },
  {
    id: 'lake-nakki',
    name: 'Nakki Lake',
    category: 'lakes',
    lat: 24.5944,
    lng: 72.7128,
    district: 'Sirohi (Mount Abu)',
    description: 'A beautiful high-altitude sacred lake in Mount Abu hill station, surrounded by bizarre geological rock shapes like Toad Rock.',
    history: 'According to famous Hindu legends, the lake was dug out entirely by the gods using their fingernails (Nakh) to shelter from a demong King.',
    culturalImportance: 'Sacred to local Garasia tribal communities who perform ancestral rituals here. Rich center of folklore.',
    famousFestival: 'Mount Abu Summer & Winter Festivals',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Nakki+Lake+Mount+Abu'
  },
  // Wildlife
  {
    id: 'wildlife-ranthambore',
    name: 'Ranthambore National Park',
    category: 'wildlife',
    lat: 25.9982,
    lng: 76.3884,
    district: 'Sawai Madhopur',
    description: 'One of the absolute premier tiger reserves in Northern India; features dry deciduous forests wrapped around the ancient 10th-c. Ranthambore Fort.',
    history: 'Formerly the private hunting grounds of the Maharajas of Jaipur. Selected under Project Tiger in 1973; declared a National Park in 1980.',
    culturalImportance: 'Famous for Machli (legendary tigress) and having the unique Trinetra Ganesha Temple located inside the fort boundaries.',
    famousFestival: 'Ganesh Chaturthi Fair at the Forest Ganesh Temple',
    image: 'https://images.unsplash.com/photo-1581850518616-bcb8077fa212?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Ranthambore+National+Park'
  },
  {
    id: 'wildlife-keoladeo',
    name: 'Keoladeo Ghana Bird Sanctuary',
    category: 'wildlife',
    lat: 27.1592,
    lng: 77.5255,
    district: 'Bharatpur',
    description: 'A remarkable man-made, managed wetland hosting thousands of rare, migratory waterfowl. Key shelter of the highly endangered Siberian Crane.',
    history: 'Created by the local kings of Bharatpur. Designated a UNESCO World Heritage site in 1985. A crucial physical geography landmark of RPSC syllabus.',
    culturalImportance: 'Hosts 370+ bird species. Named after the ancient Shiva temple (Keoladeo) standing deep inside the marshes.',
    famousFestival: 'Siberian Winter Avian Research Exhibitions',
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Keoladeo+National+Park'
  },
  // Geography & Culture
  {
    id: 'geography-thar',
    name: 'Sam Sand Dunes (Thar Desert)',
    category: 'geography',
    lat: 26.8241,
    lng: 70.7128,
    district: 'Jaisalmer',
    description: 'The golden sand dune desert landscape of Sam, where massive waves of shifting sand dunes create the absolute iconic visual of Rajasthan.',
    history: 'Formed due to centuries of dry wind-eroded soil deposition in the Thar desert basin. RPSC Physical geography: part of the Great Indian Desert.',
    culturalImportance: 'Heart of desert caravan culture, folk singers (Manganiyars and Langa groups), and camel handlers.',
    famousFestival: 'Jaisalmer Desert Festival (Maru Mahotsav)',
    image: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Sam+Sand+Dunes+Jaisalmer'
  },
  {
    id: 'culture-kalbelia',
    name: 'Kalbelia Folk Dance Center',
    category: 'culture',
    lat: 26.2541,
    lng: 73.0412,
    district: 'Jodhpur',
    description: 'The cultural center of the Kalbelia community, famous for the sensuous snake-mimicking dance inscribed on UNESCO Folk Heritage list.',
    history: 'Kalbelia tribesmen were historically nomadic snake charmers and catchers, who masterfully adapted their hand instruments (Been, Pungi) into a premium globally acclaimed performing art.',
    culturalImportance: 'Symbolizes the incredible integration of wild desert animal motifs, deep black costumes, and high-energy music with Rajasthani identity.',
    famousFestival: 'Rajasthan Folk Arts Fair (Maand Festival)',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=400&q=80',
    govTourismLink: 'https://www.google.com/maps/search/?api=1&query=Kalbelia+Folk+Dance'
  }
];

const FILTER_CHIPS = [
  { id: 'temples', label: 'Temples', emoji: '🛕' },
  { id: 'rivers', label: 'Rivers', emoji: '🌊' },
  { id: 'culture', label: 'Culture & Arts', emoji: '🎨' },
  { id: 'geography', label: 'Geography', emoji: '⛰️' },
  { id: 'forts', label: 'Forts & Keeps', emoji: '🏰' },
  { id: 'lakes', label: 'Lakes', emoji: '💧' },
  { id: 'wildlife', label: 'Wildlife Centers', emoji: '🐅' }
];

export default function RajasthanMap({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'all' | 'temples' | 'rivers' | 'culture' | 'geography' | 'forts' | 'lakes' | 'wildlife'>('all');
  const [selectedLandmark, setSelectedLandmark] = useState<LocationItem | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Filter items matching activeTab criteria
  const filteredData = activeTab === 'all' 
    ? rajasthanAtlasData 
    : rajasthanAtlasData.filter(item => item.category === activeTab);

  // Map tile selection based on theme
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-0 md:p-3"
    >
      <style>{`
        .animated-river-cyan {
          stroke-dasharray: 8, 8;
          animation: river-flow 10s linear infinite;
          filter: drop-shadow(0px 0px 4px #06b6d4);
          transition: stroke-width 0.3s ease;
        }
        .animated-river-rose {
          stroke-dasharray: 8, 8;
          animation: river-flow 10s linear infinite;
          filter: drop-shadow(0px 0px 4px #f43f5e);
          transition: stroke-width 0.3s ease;
        }
        .animated-river-yellow {
          stroke-dasharray: 8, 8;
          animation: river-flow 10s linear infinite;
          filter: drop-shadow(0px 0px 4px #fbbf24);
          transition: stroke-width 0.3s ease;
        }
        .animated-river-cyan:hover, .animated-river-rose:hover, .animated-river-yellow:hover {
          stroke-width: 6.5px !important;
          cursor: pointer;
        }
        @keyframes river-flow {
          from { stroke-dashoffset: 160; }
          to { stroke-dashoffset: 0; }
        }
        .leaflet-container {
          background-color: ${isDarkMode ? '#0b0f19' : '#f1f5f9'} !important;
        }
      `}</style>

      <div className={`w-full h-full max-w-7xl md:rounded-[24px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        
        {/* Close Button - Responsive layout float */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-[210] p-2.5 bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md rounded-full shadow-lg transition-all active:scale-95 border border-slate-800"
        >
          <X size={18} />
        </button>

        {/* Floating Top Layer & Theme Switches */}
        <div className="absolute top-3 left-3 z-[206] flex items-center gap-2">
          {/* Header Tag */}
          <div className="bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
            <h2 className="text-[11px] font-black text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Compass size={13} className="text-indigo-400 rotate-[-15deg]" />
              RPSC Atlas Explorer
            </h2>
          </div>

          {/* Theme Toggler */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 bg-slate-900/95 backdrop-blur-md text-white rounded-xl border border-slate-800 flex items-center justify-center shrink-0 hover:bg-indigo-900/50 transition-colors"
            title="Toggle Map Style"
          >
            {isDarkMode ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-300" />}
          </button>
        </div>

        {/* Interactive Map Canvas Section */}
        <div className="flex-1 h-[42vh] xs:h-[46vh] md:h-full relative border-r border-slate-800/20">
          
          <MapContainer 
            center={[26.0, 74.5]} 
            zoom={6.8} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; CartoDB'
              url={tileUrl}
            />

            {/* Markers layer: only nodes with direct coords */}
            {filteredData.map((landmark) => {
              if (landmark.lat && landmark.lng) {
                const isSelected = selectedLandmark?.id === landmark.id;
                return (
                  <Marker
                    key={landmark.id}
                    position={[landmark.lat, landmark.lng]}
                    icon={getMarkerHtml(landmark.category, isSelected, landmark.name)}
                    eventHandlers={{
                      click: () => setSelectedLandmark(landmark),
                    }}
                  >
                    <Popup className="custom-popup" closeButton={false}>
                      <div className="p-0.5 font-sans min-w-[150px]">
                        <span className="text-[8px] font-black uppercase text-indigo-500 tracking-wider">
                          {landmark.category}
                        </span>
                        <h4 className="font-extrabold text-slate-800 text-xs mt-0.5">{landmark.name}</h4>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">{landmark.district}</p>
                        <button 
                          onClick={() => setSelectedLandmark(landmark)}
                          className="mt-2 w-full py-1 text-center bg-indigo-600 text-[9px] font-black text-white rounded-lg flex items-center justify-center gap-0.5"
                        >
                          View Syllabus Details <ChevronRight size={10} />
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}

            {/* Rivers Glowing Polylines layer */}
            {(activeTab === 'all' || activeTab === 'rivers') && 
              rajasthanAtlasData
                .filter(item => item.category === 'rivers' && item.path)
                .map((river) => {
                  const isSelectRiver = selectedLandmark?.id === river.id;
                  const flowClass = river.id === 'river-chambal' 
                    ? 'animated-river-cyan' 
                    : river.id === 'river-banas' 
                    ? 'animated-river-rose' 
                    : 'animated-river-yellow';

                  return (
                    <Polyline
                      key={river.id}
                      positions={river.path!}
                      pathOptions={{
                        color: river.color || '#38bdf8',
                        weight: isSelectRiver ? 6.5 : 4,
                        opacity: 0.95
                      }}
                      className={flowClass}
                      eventHandlers={{
                        click: () => setSelectedLandmark(river)
                      }}
                    />
                  );
                })
            }

            <ScaleControl position="bottomleft" />
            <ZoomControl position="bottomright" />
          </MapContainer>

          {/* Map Top Filters Overlaid */}
          <div className="absolute bottom-3 left-3 right-3 z-[205] max-w-full flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth bg-slate-950/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-900/60 shadow-lg">
            <button
              onClick={() => {
                setActiveTab('all');
                setSelectedLandmark(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all whitespace-nowrap border ${
                activeTab === 'all'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🗺️ All Layers
            </button>
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => {
                  setActiveTab(chip.id as any);
                  setSelectedLandmark(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wide uppercase transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                  activeTab === chip.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{chip.emoji}</span> {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Premium Informational Sidebar Dashboard Panel */}
        <div className={`md:w-96 flex flex-col ${isDarkMode ? 'bg-slate-900/40 text-slate-100' : 'bg-slate-50 text-slate-800'} overflow-y-auto p-4 md:p-5 h-[58vh] md:h-full`}>
          <div className="hidden md:block pb-4 mb-4 border-b border-slate-800/20">
            <h2 className="text-lg font-black tracking-tight leading-none uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">
              UPSC/RPSC Map Engine
            </h2>
            <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">Interactive Atlas of Rajasthan</p>
          </div>

          <AnimatePresence mode="wait">
            {selectedLandmark ? (
              <motion.div
                key={selectedLandmark.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-4 pb-4"
              >
                {/* Location Image View */}
                {selectedLandmark.image && (
                  <div className="relative h-32 md:h-36 rounded-xl overflow-hidden shadow-md border border-slate-800/10 shrink-0">
                    <img
                      src={selectedLandmark.image}
                      alt={selectedLandmark.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      <span className="px-1.5 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded uppercase tracking-wider">
                        {selectedLandmark.category}
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-300 drop-shadow flex items-center gap-0.5">
                        <MapPin size={9} /> {selectedLandmark.district}
                      </span>
                    </div>
                  </div>
                )}

                {/* Primary Information Card */}
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                  <h3 className="text-sm md:text-base font-black tracking-tight leading-snug">{selectedLandmark.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {selectedLandmark.description}
                  </p>
                </div>

                {/* Rivers Specific Specs Card */}
                {selectedLandmark.category === 'rivers' && (
                  <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-indigo-950/20 border-indigo-900/30' : 'bg-indigo-50 border-indigo-100'} text-indigo-900`}>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-2">
                      <Waves size={10} /> Hydrological Metrics
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="block text-[8px] text-indigo-400 uppercase font-black leading-none">ORIGIN STARTPOINT</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} block mt-0.5`}>{selectedLandmark.origin}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] text-indigo-400 uppercase font-black leading-none">TOTAL FLOW LENGTH</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'} block mt-0.5`}>{selectedLandmark.length}</span>
                      </div>
                      <div className="col-span-2 mt-1">
                        <span className="block text-[8px] text-indigo-400 uppercase font-black leading-none mb-1">MAJOR TRIBUTARIES</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedLandmark.tributaries?.map((trib, i) => (
                            <span key={i} className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded ${isDarkMode ? 'bg-slate-900 text-indigo-300' : 'bg-white text-indigo-700'} border border-indigo-500/10`}>
                              {trib}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Syllabus relevance */}
                <div className="space-y-1">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <BookOpen size={11} /> Syllabus Relevance
                  </h4>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className="text-[11px] font-bold text-indigo-400">RPSC GS Paper I: Culture & Geography</p>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-1">Detailed evaluation of {selectedLandmark.name} and its historical relevance to Rajasthan public service competitive examinations.</p>
                  </div>
                </div>

                {/* Historical details */}
                <div className="space-y-1.5">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <HistoryIcon size={11} /> Historical Accounts
                  </h4>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {selectedLandmark.history}
                    </p>
                  </div>
                </div>

                {/* Culture highlights & Festivals */}
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="block text-[8px] text-indigo-400 uppercase font-black leading-none">CULTURAL FIT</span>
                    <span className="block text-[10px] text-slate-300 font-semibold leading-tight mt-1">{selectedLandmark.culturalImportance}</span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className="block text-[8px] text-pink-400 uppercase font-black leading-none">FAMOUS FESTIVAL</span>
                    <span className="block text-[10px] text-slate-300 font-semibold leading-tight mt-1">{selectedLandmark.famousFestival}</span>
                  </div>
                </div>

                {/* Action Controls & GPS Trigger */}
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => setSelectedLandmark(null)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider text-center"
                  >
                    Clear Focus
                  </button>
                  {selectedLandmark.govTourismLink && (
                    <a 
                      href={selectedLandmark.govTourismLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 shadow shadow-indigo-900/20"
                    >
                      Real Location <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                <div className="w-16 h-16 bg-slate-850/50 rounded-full flex items-center justify-center mb-3">
                  <Compass size={28} className="text-slate-500 animate-spin-slow rotate-[45deg]" />
                </div>
                <h3 className="text-xs font-bold text-slate-300">Interactive Learning Atlas</h3>
                <p className="text-[10px] mt-1.5 text-slate-400 max-w-[220px] leading-relaxed">
                  Select any geographical region, historical monument, or glowing river on the map canvas to trace physical features.
                </p>

                {/* Quick select targets */}
                <div className="mt-6 space-y-2 w-full max-w-[240px]">
                  <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest text-left mb-1">HIGH-YIELD TOPICS</span>
                  {rajasthanAtlasData.slice(0, 3).map(l => (
                    <button 
                      key={l.id}
                      onClick={() => setSelectedLandmark(l)}
                      className={`p-2.5 w-full border ${isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-300 hover:border-indigo-500 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-500 hover:text-indigo-600'} rounded-lg text-[10px] font-bold text-left transition-all flex items-center justify-between group`}
                    >
                      <span>{l.name}</span>
                      <ChevronRight size={10} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
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
