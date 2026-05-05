/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent, ReactNode } from "react";
import { Search, User, Tv, Calendar, Home, Play, Pause, Radio, Info, Sun, Moon, Maximize, Settings, Volume2, VolumeX, CheckCircle2, Shield, LogOut, LogIn, Heart, X, Lock, Terminal, Zap, Clock, History, MousePointer2, Sliders, ChevronLeft, ChevronRight, Mic, Layers, Filter, Sparkles, Camera, Palette, Layout, MessageSquare, Eye, EyeOff, ExternalLink, Monitor, Columns, Maximize2, Circle, AlertCircle, RotateCcw, Droplet, Trophy, Film, Music, Globe, Users, Activity, ShieldCheck, LayoutGrid, ArrowRight, ArrowLeft, TrendingUp, Star, Crown, Menu, Pin, Send, Accessibility, Navigation, LayoutTemplate, LayoutPanelLeft, FlaskConical as Flask } from "lucide-react";
import Hls from "hls.js";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, updateDoc, arrayUnion, getDocFromServer } from "firebase/firestore";

import { channels, Channel } from "./channels";

// Test connection as per critical directive
// Test connection removed

const SettingsIcon = ({ className }: { className?: string }) => (
  <Settings className={`${className} flex-shrink-0`} />
);

const SplashScreen = ({ isDark, onEnter, duration = 5000, featureFlags, loadingTreatment }: { isDark: boolean, onEnter: () => void, duration?: number, featureFlags?: any, loadingTreatment: string }) => {
  const getLoadingGif = () => {
    if (!featureFlags?.revamp_processing_loading_circle) {
      return "https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif";
    }
    switch (loadingTreatment) {
      case "treatment1": return "https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original";
      case "treatment2": return "https://cdn.pixabay.com/animation/2025/10/01/12/56/12-56-37-235_512.gif";
      case "treatment3": return "https://cdn.pixabay.com/animation/2025/09/06/21/34/21-34-46-885_512.gif";
      default: return "https://cdn.pixabay.com/animation/2023/10/08/03/19/03-19-26-213_512.gif";
    }
  };

  useEffect(() => {
    const timer = setTimeout(onEnter, duration);
    return () => clearTimeout(timer);
  }, [onEnter, duration]);

  const loadingUrl = getLoadingGif();

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden"
    >
      <img 
        src="https://wallpapercave.com/wp/wp3183649.png" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="background"
      />
      <div className={`absolute inset-0 ${isDark ? "bg-slate-950/60" : "bg-black/10"}`} />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center space-y-10"
      >
        <div className="relative">
          <motion.img 
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 0.9], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
            alt="Vplay Logo" 
            className={`h-56 w-56 md:h-72 md:w-72 object-contain ${
              !isDark ? "drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]" : "drop-shadow-[0_0_30_rgba(168,85,247,0.3)]"
            }`}
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex flex-col items-center space-y-4 px-6 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className={`${isDark ? "text-white/40" : "text-black/60"} text-sm md:text-base font-medium tracking-[0.2em] uppercase text-center max-w-xs md:max-w-none`}
          >
            Gói trọn Việt Nam trong tầm mắt bạn
          </motion.p>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="flex items-center gap-4 pt-4"
          >
            <img 
              src={loadingUrl} 
              alt="Loading" 
              className={`w-12 h-12 ${
                !featureFlags?.revamp_processing_loading_circle && isDark ? "filter brightness-0 invert" : 
                ((loadingTreatment === "treatment1" || loadingTreatment === "treatment3") && !isDark && featureFlags?.revamp_processing_loading_circle) ? "filter grayscale brightness-0" : ""
              }`} 
              referrerPolicy="no-referrer"
            />
            <span className={`${isDark ? "text-white/60" : "text-black/80"} text-xl font-medium tracking-tight`}>Preparing your experience</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Sparkles2 = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <circle cx="19" cy="5" r="2" fill="currentColor" stroke="none" />
  </svg>
);

const baseTabs = [
  { name: "Trang chủ", icon: Home, id: "Trang chủ" },
  { name: "Phát sóng", icon: Tv, id: "Phát sóng" },
  { name: "Bảo tàng lưu trữ", icon: Calendar, id: "Lưu trữ" },
  { name: "Experimental", icon: Flask, id: "Experimental" },
  { name: "Quản trị", icon: Shield, id: "Quản trị" },
  { name: "Cài đặt", icon: Settings, id: "Cài đặt" },
];

// Channel type is imported from channels.ts

function LiquidModal({ isOpen, onClose, children, isDark, title, description, liquidGlass }: { 
  isOpen: boolean, 
  onClose: () => void, 
  children?: ReactNode, 
  isDark: boolean,
  title?: string,
  description?: string,
  liquidGlass: "glassy" | "tinted"
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/40 ${liquidGlass ? "backdrop-blur-sm" : ""}`}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-sm overflow-hidden ${
              isDark 
                ? "popup-3d-dark" 
                : "popup-3d-light"
            } ${
              liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"
            }`}
          >
            <div className="p-8 text-center">
              {title && <h3 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>}
              {description && <p className={`${isDark ? "text-white/60" : "text-black/60"} text-sm leading-relaxed mb-6 font-medium`}>{description}</p>}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Tooltip({ text, show, targetRect }: { text: string, show: boolean, targetRect: DOMRect | null }) {
  return (
    <AnimatePresence>
      {show && targetRect && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          style={{ 
            position: 'fixed', 
            top: targetRect.top - 50, 
            left: targetRect.left + (targetRect.width / 2),
            translateX: '-50%'
          }}
          className="px-4 py-2 bg-white/80 backdrop-blur-xl text-slate-900 text-[12px] font-bold rounded-2xl whitespace-nowrap pointer-events-none z-[100] shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/40"
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-white/80" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ChannelLogo({ src, alt, className, isDark, liquidGlass }: { src: string, alt: string, className?: string, isDark: boolean, liquidGlass?: "glassy" | "tinted" }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-slate-800/50 rounded-[24px] border border-slate-700/50 p-1 text-center`}>
        <Tv className={`h-6 w-6 mb-1 ${liquidGlass === "tinted" ? "text-black" : "text-slate-500"}`} />
        <span className={`text-[10px] font-bold leading-tight line-clamp-2 uppercase ${liquidGlass === "tinted" ? "text-black/60" : "opacity-60"}`}>{alt}</span>
      </div>
    );
  }

  const scaleMap: { [key: string]: string } = {
    "Lâm Đồng 1 (LTV1)": "md:scale-[1.4]",
    "Đà Nẵng 1 (DNRT1)": "scale-[1.5] md:scale-[1.7]",
    "Đà Nẵng 2 (DNRT2)": "scale-[1.4] md:scale-[1.7]",
    "Thái Nguyên (TN)": "md:scale-[1.5]",
    "Điện Biên (ĐTV)": "md:scale-[0.8]",
    "Hưng Yên (HYTV)": "md:scale-[1.7]",
    "Đồng Tháp 1 (THĐT1)": "scale-[2.0] md:scale-[1.4]",
    "Huế (HueTV)": "md:scale-[1.4]",
    "Tây Ninh (TN)": "md:scale-[1.4]",
    "H1": "scale-[1.6] md:scale-[2.0]",
    "H2": "scale-[1.6] md:scale-[2.0]",
    "Đắk Lắk (DRT)": "scale-[1.2] md:scale-[1.4]",
    "ĐNNRTV1": "scale-[1.1] md:scale-[1.1]",
    "ĐNNRTV2": "scale-[1.1] md:scale-[1.1]",
    "Nghệ An (NTV)": "md:scale-[1.4]",
    "Quảng Ngãi 1 (QNgTV1)": "md:scale-[1.5]",
    "Quảng Ngãi 2 (QNgTV2)": "md:scale-[1.5]",
    "HTV Thể Thao": "scale-[1.5] md:scale-[1.5]",
    "VTV1": "scale-[1.14] md:scale-[0.92]",
    "VTV7": "scale-[1.24] md:scale-[1.01]",
    "VTV10": "scale-[1.11] md:scale-[1.0]"
  };

  const scaleClass = scaleMap[alt] || (alt.startsWith("VTV") ? "md:scale-[0.9]" : "");

  return (
    <img 
      src={src} 
      alt={alt} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={`${className} object-contain transition-all duration-300 ${
        liquidGlass === "tinted" 
          ? "opacity-100" 
          : !isDark ? "drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]" : ""
      } ${scaleClass}`} 
    />
  );
}

function ChannelCard({ ch, onClick, isDark, isActive, favorites, toggleFavorite, liquidGlass, className }: {
  ch: Channel,
  onClick: () => void,
  isDark: boolean,
  isActive?: boolean,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  liquidGlass: "glassy" | "tinted",
  className?: string,
  key?: string | number
}) {
  const isMaintenance = ch.status === "maintenance";

  return (
    <div className={`relative group ${className || ""}`}>
      {/* Background blur/glow effect */}
      <div className={`absolute -inset-1 rounded-[32px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 ${isActive ? "bg-purple-500/20 opacity-100" : isDark ? "bg-white/5" : "bg-slate-500/10"}`} />
      
      <motion.button
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`w-full aspect-video p-5 md:p-6 flex items-center justify-center border relative overflow-hidden transition-all duration-300 card-3d z-10 ${
          isActive
            ? `bg-[#a855f7] border-[#a855f7] ring-4 ring-purple-500 shadow-[2px_2px_0_0_#6b21a8,4px_4px_10px_0_rgba(0,0,0,0.3)] backdrop-blur-md !translate-x-[-2px] !translate-y-[-2px]`
            : isDark ? "btn-3d-dark" : "btn-3d-slate"
        } ${
          liquidGlass 
            ? `rounded-[32px] ${
                liquidGlass === "tinted" 
                  ? `${isActive ? "bg-[#a855f7]/90" : "bg-white/80"} backdrop-blur-md border-white/20` 
                  : `${isActive ? "bg-[#a855f7]/40" : "bg-white/5"} backdrop-blur-2xl border-white/10`
              }` 
            : "rounded-[32px] backdrop-blur-none"
        } active:translate-x-[4px] active:translate-y-[4px] active:shadow-none`}
      >
        {isMaintenance && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-20 shadow-lg">
            BẢO TRÌ
          </div>
        )}
        <ChannelLogo src={ch.logo} alt={ch.name} className={`w-full h-full ${isMaintenance ? "grayscale opacity-20" : ""} transition-transform duration-500`} isDark={isDark} liquidGlass={liquidGlass} />
      </motion.button>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleFavorite(ch); }}
        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 ${
          favorites.includes(ch.name) ? "text-red-500 bg-red-50/20" : "text-white bg-black/20"
        }`}
      >
        <Heart className={`h-4 w-4 ${favorites.includes(ch.name) ? "fill-red-500" : ""}`} />
      </button>
    </div>
  );
}


const slides = [
  { 
    url: "https://media.discordapp.net/attachments/1491785835912237209/1492909965617270784/image.png?ex=69f17b80&is=69f02a00&hm=964af4caa71a48dbb4abbc418c695bffdf32250ab7eab716c356bba75f5d4ece&=&format=webp&quality=lossless&width=800&height=450", 
    title: "Giải trí không giới hạn", 
    desc: "Hơn 200+ kênh truyền hình HD chất lượng cao hoàn toàn miễn phí mỗi ngày.",
    tag: "Vplay Web"
  },
  { 
    url: "https://media.discordapp.net/attachments/1491785835912237209/1492904393862025467/spc_20260412_220807.png?ex=69f17650&is=69f024d0&hm=ea45aa8e541ca18266a4b0557a2bd5e5bcb040060d1ef4949a4ca4c09a0a7d8b&=&format=webp&quality=lossless&width=605&height=340", 
    title: "Giao diện Liquid Glass", 
    desc: "Trải nghiệm xem truyền hình tương lai với hiệu ứng kính mờ và chuyển động mượt mà đầy mê hoặc.",
    tag: "Thiết kế"
  }
];

function HomeContent({ setActiveTab, setActiveChannel, isDark, favorites, toggleFavorite, liquidGlass, user, onLogin, slideIndex, direction, paginate, bypassed }: {
  setActiveTab: (tab: string) => void,
  setActiveChannel: (ch: typeof channels[0]) => void,
  isDark: boolean,
  favorites: string[],
  toggleFavorite: (ch: typeof channels[0]) => void,
  liquidGlass: "glassy" | "tinted",
  user: any,
  onLogin: () => void,
  slideIndex: number,
  direction: number,
  paginate: (newDirection: number) => void,
  bypassed?: boolean
}) {
  const [randomChannels, setRandomChannels] = useState<typeof channels>([]);
  
  useEffect(() => {
    const shuffled = [...channels].sort(() => 0.5 - Math.random());
    setRandomChannels(shuffled.slice(0, 12));
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 1.1
    }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 }
    })
  };

  const favoriteChannels = channels.filter(ch => favorites.includes(ch.name));
  const trendingChannels = channels.slice(0, 4);

  return (
    <div className="relative space-y-16 pb-32 max-w-7xl mx-auto px-4 md:px-8">
      {/* Dynamic Hero Section */}
      <div className="relative overflow-hidden rounded-[40px] aspect-[16/9] md:aspect-[2.5/1] group shadow-2xl border border-white/5">
        <AnimatePresence initial={false} custom={direction}>
          <motion.img
            key={slideIndex}
            src={slides[slideIndex].url}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 500, damping: 40 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.4 }
            }}
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        
        {/* Glass Overlay for Text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-14 z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            key={`text-${slideIndex}`}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-semibold uppercase tracking-widest mb-2">
              <img 
                src="https://static.wikia.nocookie.net/ftv/images/d/d9/SMR26.png/revision/latest?cb=20260427024320&path-prefix=vi"
                alt="SMR26"
                className="w-4 h-4 object-contain"
                referrerPolicy="no-referrer"
              />
              {slides[slideIndex].tag}
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tighter text-white uppercase leading-tight max-w-2xl">
              {slides[slideIndex].title}
            </h1>
            <p className="text-white/70 text-sm md:text-base font-medium max-w-xl leading-relaxed">
              {slides[slideIndex].desc}
            </p>
          </motion.div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 flex justify-between z-30 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={() => paginate(-1)} className="p-3 rounded-full bg-white/10 backdrop-blur-2xl text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/10">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => paginate(1)} className="p-3 rounded-full bg-white/10 backdrop-blur-2xl text-white hover:bg-white/20 hover:scale-110 transition-all border border-white/10">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* Suggested Section - Moved up */}
      <div className="space-y-10">
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Sparkles size={18} />
            </div>
            <h1 className={`text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Gợi ý cho bạn</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px] ml-11">TOP TRENDING & RECOMMENDED FOR YOU</p>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {randomChannels.map(ch => (
            <ChannelCard 
              key={`${ch.name}-${ch.stream}`} 
              ch={ch} 
              className="hover:scale-105"
              onClick={() => {
                setActiveChannel(ch);
                setActiveTab("Phát sóng");
              }} 
              isDark={isDark} 
              favorites={favorites} 
              toggleFavorite={toggleFavorite} 
              liquidGlass={liquidGlass}
            />
          ))}
        </div>
      </div>

      {/* Premium Guest Loyalty Banner */}
      {!user && !bypassed && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className={`relative overflow-hidden group/banner rounded-[64px] border border-white/20 p-1 md:p-1.5 transition-all duration-700 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] ${isDark ? "bg-white/5" : "bg-black/5"}`}
        >
          <div className={`relative overflow-hidden rounded-[58px] p-10 md:p-16 flex flex-col xl:flex-row items-center gap-12 md:gap-20 transition-all duration-700 ${isDark ? "bg-slate-900/90" : "bg-white/90"}`}>
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 z-0 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-1000">
               <motion.div 
                 animate={{ 
                    scale: [1, 1.2, 1],
                    x: [0, 100, 0],
                    rotate: [0, 10, 0]
                 }}
                 transition={{ duration: 20, repeat: Infinity }}
                 className="absolute top-[-50%] right-[-10%] w-full h-full bg-purple-500/20 blur-[150px] rounded-full" 
               />
               <motion.div 
                 animate={{ 
                    scale: [1, 1.3, 1],
                    x: [0, -80, 0],
                    rotate: [0, -15, 0]
                 }}
                 transition={{ duration: 25, repeat: Infinity }}
                 className="absolute bottom-[-50%] left-[-10%] w-full h-full bg-blue-500/20 blur-[150px] rounded-full" 
               />
            </div>

            <div className="flex-1 space-y-8 relative z-10 text-center xl:text-left">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-2xl bg-purple-500 text-white font-semibold text-xs uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(168,85,247,0.4)]">
                <Crown size={16} /> 
                Quyền lợi tối thượng
              </div>
              
              <h2 className={`text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] ${isDark ? "text-white" : "text-slate-900"}`}>
                Xem mượt hơn, <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                  Riêng tư hơn
                </span>
              </h2>
              
              <p className={`text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto xl:mx-0 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Đăng nhập để trải nghiệm hệ sinh thái Vplay 4K hoàn toàn miễn phí. <br className="hidden md:block" />
                Lưu kênh yêu thích, nhận đề xuất cá nhân hóa và đồng bộ trên mọi thiết bị.
              </p>

              <div className="flex flex-wrap items-center justify-center xl:justify-start gap-10 pt-4">
                 {[
                   { icon: Heart, text: "Yêu thích", color: "text-red-500" },
                   { icon: Sparkles, text: "Gợi ý AI", color: "text-amber-500" },
                   { icon: Zap, text: "Tốc độ Pro", color: "text-blue-500" }
                 ].map((feat, i) => (
                   <div key={feat.text} className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feat.color} bg-white/5 border border-white/10 backdrop-blur-xl shadow-lg`}>
                         <feat.icon size={20} fill={feat.text === "Yêu thích" ? "currentColor" : "none"} />
                      </div>
                      <span className={`text-sm font-semibold uppercase tracking-widest ${isDark ? "text-white/60" : "text-slate-500"}`}>{feat.text}</span>
                   </div>
                 ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 shrink-0 w-full xl:w-[420px] relative z-10">
                 <motion.button 
                  onClick={onLogin}
                  whileHover={{ scale: 1.02, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-24 relative group/login overflow-hidden bg-white text-black font-semibold rounded-[36px] transition-all shadow-[0_30px_70px_rgba(255,255,255,0.15)] flex items-center justify-center gap-4 text-2xl"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover/login:opacity-10 transition-opacity" />
                   ĐĂNG NHẬP NGAY
                   <ArrowRight className="w-8 h-8 group-hover/login:translate-x-3 transition-transform" />
                </motion.button>
               
               <div className="flex items-center justify-center gap-6">
                  <div className="flex -space-x-3">
                     {[1,2,3,4].map(i => (
                       <div key={i} className={`w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white`}>
                          U{i}
                       </div>
                     ))}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                     <span className="text-purple-400">+100K</span> NGƯỜI DÙNG <br /> ĐÃ THAM GIA
                  </div>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Featured Ad Banner - System Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-8 md:p-12 rounded-[48px] border relative overflow-hidden flex flex-col justify-between group cursor-pointer ${isDark ? "bg-slate-900 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl -mr-32 -mt-32 transition-all group-hover:scale-110" />
          <div className="space-y-4 relative z-10">
            <div className="p-3 w-fit rounded-2xl bg-blue-500/10 text-blue-500">
              <Monitor size={28} />
            </div>
            <h3 className={`text-3xl font-semibold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>XEM VPLAY MỌI NƠI</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Ứng dụng nền tảng Web mang lại trải nghiệm xem truyền hình mượt mà trên cả máy tính, máy tính bảng và điện thoại mà không cần cài đặt.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-blue-500 font-semibold text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
            Khám phá công nghệ <ArrowRight size={14} />
          </div>
        </div>

        <div className={`p-8 md:p-12 rounded-[48px] border relative overflow-hidden flex flex-col justify-between group cursor-pointer ${isDark ? "bg-slate-900 border-white/5" : "bg-white border-slate-200 shadow-xl"}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl -mr-32 -mt-32 transition-all group-hover:scale-110" />
          <div className="space-y-4 relative z-10">
            <div className="p-3 w-fit rounded-2xl bg-amber-500/10 text-amber-500">
              <Zap size={28} />
            </div>
            <h3 className={`text-3xl font-semibold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>TỐC ĐỘ 4K SIÊU NHANH</h3>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs">
              Sử dụng CDN đa khu vực giúp luồng phát video đạt chất lượng 4K AI sắc nét với độ trễ tối thiểu, không giật lag ngay cả giờ cao điểm.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-2 text-amber-500 font-semibold text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
            Kiểm tra đường truyền <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-10">
          <div className="flex flex-col gap-2 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <Heart size={18} fill="currentColor" />
              </div>
              <h3 className={`text-3xl font-semibold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Truy cập nhanh</h3>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px] ml-11">QUICK ACCESS TO SAVED CHANNELS</p>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {favoriteChannels.map(ch => (
              <ChannelCard 
                key={ch.name} 
                ch={ch} 
                className="hover:scale-105"
                onClick={() => {
                  setActiveChannel(ch);
                  setActiveTab("Phát sóng");
                }} 
                isDark={isDark} 
                favorites={favorites} 
                toggleFavorite={toggleFavorite} 
                liquidGlass={liquidGlass}
              />
            ))}
          </div>
        </div>
      )}

      {/* Suggested Section */}
      <div className="space-y-10">
        <div className="flex flex-col gap-2 px-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Sparkles size={18} />
            </div>
            <h1 className={`text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Gợi ý cho bạn</h1>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px] ml-11">TOP TRENDING & RECOMMENDED FOR YOU</p>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {randomChannels.map(ch => (
            <ChannelCard 
              key={`${ch.name}-${ch.stream}`} 
              ch={ch} 
              className="hover:scale-105"
              onClick={() => {
                setActiveChannel(ch);
                setActiveTab("Phát sóng");
              }} 
              isDark={isDark} 
              favorites={favorites} 
              toggleFavorite={toggleFavorite} 
              liquidGlass={liquidGlass}
            />
          ))}
        </div>
      </div>
    </div>
  );
}


function IndividualPlayer({ channel, isMuted, volume, isDark }: { channel: Channel, isMuted: boolean, volume: number, isDark: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(channel.stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.stream;
    }

    return () => {
      if (hlsRef.current) hlsRef.current.destroy();
    };
  }, [channel]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  return (
    <video 
      ref={videoRef} 
      className="w-full h-full object-cover" 
      autoPlay 
      playsInline
      muted={isMuted}
    />
  );
}

function TVContent({ active, setActive, isDark, favorites, toggleFavorite, user, onLogin, isDev, liquidGlass, sortOrder, setSortOrder, showSplash, featureFlags, searchQuery, bypassed, setIsPlayerInView }: { 
  active: Channel, 
  setActive: (ch: Channel) => void, 
  isDark: boolean,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  user: any,
  onLogin: () => void,
  isDev?: boolean,
  liquidGlass: "glassy" | "tinted",
  sortOrder: "default" | "az" | "za",
  setSortOrder: (val: "default" | "az" | "za") => void,
  showSplash?: boolean,
  featureFlags: { [key: string]: boolean },
  searchQuery: string,
  bypassed?: boolean,
  setIsPlayerInView: (val: boolean) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsPlayerInView(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [setIsPlayerInView]);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false); // Default to sound ON
  const [volume, setVolume] = useState(1);
  const [levels, setLevels] = useState<Hls.Level[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [filterType, setFilterType] = useState<string>("Tất cả");
  const [streamError, setStreamError] = useState<string | null>(null);

  // categories definition removed to avoid duplication

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Multiview state
  const [isMultiview, setIsMultiview] = useState(false);
  const [multiviewCount, setMultiviewCount] = useState(4); // Default 4 channels
  const [multiviewChannels, setMultiviewChannels] = useState<(Channel | null)[]>([]);
  const [multiviewVolumes, setMultiviewVolumes] = useState<{ [key: number]: number }>({});
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  useEffect(() => {
    if (multiviewChannels.length === 0) {
      setMultiviewChannels([active, ...Array(multiviewCount - 1).fill(null)]);
    } else {
      const newChannels = [...multiviewChannels];
      if (newChannels.length < multiviewCount) {
        setMultiviewChannels([...newChannels, ...Array(multiviewCount - newChannels.length).fill(null)]);
      } else if (newChannels.length > multiviewCount) {
        setMultiviewChannels(newChannels.slice(0, multiviewCount));
      }
    }
  }, [multiviewCount]);

  useEffect(() => {
    if (isMultiview && multiviewChannels[0]?.name !== active.name) {
      setMultiviewChannels(prev => {
        const next = [...prev];
        next[0] = active;
        return next;
      });
    }
  }, [active, isMultiview]);

  const toggleMultiview = () => {
    if (!isMultiview) {
      setMultiviewChannels([active, ...Array(multiviewCount - 1).fill(null)]);
    }
    setIsMultiview(!isMultiview);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const isMaintenance = active.status === "maintenance";

  const filteredChannels = channels
    .filter(ch => {
      const matchesSearch = ch.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "Tất cả" 
        || (filterType === "Hoạt động" && ch.status !== "maintenance")
        || (filterType === "Bảo trì" && ch.status === "maintenance")
        || ch.category === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortOrder === "default") return 0;
      if (sortOrder === "az") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });

  const CATEGORY_ORDER = ["VTV", "HTV", "VTVcab", "Địa phương", "Thiết yếu", "Phát thanh"];
  const filteredCategories = CATEGORY_ORDER.filter(cat => 
    filteredChannels.some(ch => ch.category === cat)
  );

  useEffect(() => {
    if (!user && !isDev && !bypassed) return;
    if (showSplash) return; // Wait until sound is unblocked by user interaction
    
    // Always try to reset mute when splash is gone
    setIsMuted(false);

    if (active.status === "maintenance") {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      setIsPlaying(true);
      setStreamError(null);
      // Native autoPlay attribute mixed with muted=true in JSX handles playback perfectly
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Track watched channel
    if (user) {
      const userRef = doc(db, "users", user.uid);
      updateDoc(userRef, {
        watchedChannels: arrayUnion(active.name)
      }).catch(err => handleFirestoreError(err, OperationType.UPDATE, 'users/' + user.uid));
    }

    video.volume = volume;
    setStreamError(null);
    let isEffectMounted = true;

    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60
      });
      hlsRef.current = hls;
      hls.attachMedia(video);
      
      // Remove proxy for live streams because native HLS correctly resolves relative URLs and CDNs handle CORS.
      // The proxy was originally created for testing but breaks chunk requests.
      hls.loadSource(active.stream);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (!isEffectMounted) return;
        setStreamError(null);
        setIsPlaying(true);
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name === 'AbortError') return;
            console.warn("Autoplay prevented, trying muted", e);
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
        setLevels(hls!.levels);
        setCurrentLevel(hls!.currentLevel);
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (!isEffectMounted) return;
        setCurrentLevel(data.level);
      });
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!isEffectMounted) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setStreamError("Lỗi mạng: Không thể tải luồng phát. Vui lòng kiểm tra kết nối hoặc CORS.");
              hls!.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setStreamError("Lỗi media: Dữ liệu video không hợp lệ.");
              hls!.recoverMediaError();
              break;
            default:
              setStreamError("Lỗi không xác định khi tải kênh.");
              hls!.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      const proxyUrl = `/proxy?url=${encodeURIComponent(active.stream)}`;
      video.src = proxyUrl;
      const onLoadedMetadata = () => {
        if (!isEffectMounted) return;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        }
      };
      const onError = () => {
        if (!isEffectMounted) return;
        setStreamError("Trình duyệt báo lỗi khi phát luồng này.");
      };
      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('error', onError);
    }

    return () => {
      isEffectMounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [active, user]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val > 0 && isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      } else if (val === 0 && !isMuted) {
        videoRef.current.muted = true;
        setIsMuted(true);
      }
    }
  };

  const setQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setShowQualityMenu(false);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      const video = videoRef.current;
      if (!video) return;

      try {
        // @ts-ignore - captureStream is semi-standard
        const stream = video.captureStream ? video.captureStream() : (video as any).mozCaptureStream ? (video as any).mozCaptureStream() : null;
        
        if (!stream) {
          alert("Trình duyệt không hỗ trợ ghi hình video.");
          return;
        }

        const mimeType = MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = recorder;
        chunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          
          const date = new Date();
          const timestamp = date.getFullYear() + 
                          ('0' + (date.getMonth() + 1)).slice(-2) + 
                          ('0' + date.getDate()).slice(-2) + "_" + 
                          ('0' + date.getHours()).slice(-2) + 
                          ('0' + date.getMinutes()).slice(-2);
          
          const filename = `${active.name}_${timestamp}_vplayrec.mp4`;
          
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Recording error:", err);
        alert("Lỗi khi ghi hình. Có thể do giới hạn bảo mật (CORS) của luồng phát này.");
      }
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }
  };

  // categories definition removed to avoid duplication

  const [showChannelSelector, setShowChannelSelector] = useState<{ idx: number } | null>(null);
  const [channelSearch, setChannelSearch] = useState("");

  const filteredMultiviewChannels = channels.filter(c => 
    c.name.toLowerCase().includes(channelSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(channelSearch.toLowerCase())
  );

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto">
      {/* Liquid Modal for Channel Selection */}
      <LiquidModal
        isOpen={!!showChannelSelector}
        onClose={() => { setShowChannelSelector(null); setChannelSearch(""); }}
        isDark={isDark}
        title="Chọn kênh Multiview"
        description="Tìm kiếm và chọn kênh truyền hình bạn muốn thêm vào lưới Multiview"
        liquidGlass={liquidGlass}
      >
        <div className="space-y-6">
          <div className={`relative group flex items-center gap-3 px-6 py-4 rounded-full overflow-hidden transition-all ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
            <Search size={18} className={`transition-colors ${isDark ? "text-slate-500 group-focus-within:text-purple-400" : "text-slate-400 group-focus-within:text-purple-600"}`} />
            <input 
              type="text"
              placeholder="Tìm tên kênh hoặc thể loại..."
              value={channelSearch}
              onChange={(e) => setChannelSearch(e.target.value)}
              className={`bg-transparent border-none outline-none text-sm font-bold w-full placeholder-slate-500 ${isDark ? "text-white" : "text-slate-900"}`}
            />
            <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
          </div>

          <div className="max-h-[350px] overflow-y-auto px-1 space-y-2 custom-scrollbar pr-2">
            {filteredMultiviewChannels.length > 0 ? (
              filteredMultiviewChannels.map(c => (
                <button
                  key={c.name}
                  onClick={() => {
                    if (showChannelSelector) {
                      setMultiviewChannels(prev => {
                        const next = [...prev];
                        next[showChannelSelector.idx] = c;
                        return next;
                      });
                      setShowChannelSelector(null);
                      setChannelSearch("");
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-3 rounded-[20px] transition-all group ${isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-900"}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 border ${isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200"}`}>
                    <img src={c.logo} alt={c.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm leading-tight uppercase tracking-tight">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{c.category}</p>
                  </div>
                  <div className="p-2 rounded-full bg-purple-500/10 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <LogIn size={16} />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-slate-500/10 text-slate-500">
                  <Search size={32} />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Không tìm thấy kênh nào</p>
              </div>
            )}
          </div>
        </div>
      </LiquidModal>

      {/* VIDEO PLAYER */}
      <div 
        ref={containerRef}
        className={`bg-black mb-6 flex items-center justify-center border shadow-2xl relative overflow-hidden group ${
        isMultiview ? "aspect-auto min-h-[400px]" : "aspect-video"
      } ${
        liquidGlass ? "rounded-2xl" : "rounded-lg"
      } ${isDark ? "border-slate-800" : "border-slate-300"}`}>
        {!user && !isDev && !bypassed ? (
          <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/40 p-6 text-center ${
            liquidGlass ? "backdrop-blur-xl" : "backdrop-blur-none"
          }`}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-10 border shadow-2xl flex flex-col items-center space-y-6 bg-white/80 border-black/5 ${
                liquidGlass ? "rounded-[40px]" : "rounded-2xl"
              }`}
            >
              <div className="p-4 rounded-full bg-purple-50">
                <Lock className="h-10 w-10 text-purple-600" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900">Đăng nhập để xem</h3>
                <p className="text-slate-500 text-sm max-w-[280px]">Vui lòng đăng nhập tài khoản VPlay để có thể xem kênh trực tuyến này.</p>
              </div>
              <button 
                onClick={onLogin}
                className="btn-purple-3d w-full"
              >
                Đăng nhập ngay
              </button>
            </motion.div>
          </div>
        ) : isMultiview ? (
          <div className={`w-full h-full grid gap-2 p-2 ${
            multiviewCount <= 2 ? "grid-cols-2" : 
            multiviewCount <= 4 ? "grid-cols-2" : 
            "grid-cols-3"
          }`}>
            {multiviewChannels.map((ch, idx) => (
              <div key={idx} className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-white/5 group/slot">
                {ch ? (
                  <IndividualPlayer 
                    channel={ch} 
                    isMuted={multiviewVolumes[idx] === 0 || multiviewVolumes[idx] === undefined} 
                    volume={multiviewVolumes[idx] ?? 0}
                    isDark={isDark}
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-500">
                    <div className="p-4 rounded-full bg-white/5 border border-white/5">
                      <Tv size={32} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Trống</span>
                  </div>
                )}
                
                {/* Individual Control Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {ch && <img src={ch.logo} className="w-4 h-4 object-contain" />}
                    <span className="text-[10px] font-bold text-white truncate">{ch?.name || "Chọn kênh"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 size={12} className="text-white opacity-60" />
                    <input 
                      type="range" min="0" max="1" step="0.1" 
                      value={multiviewVolumes[idx] ?? 0}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setMultiviewVolumes(prev => ({ ...prev, [idx]: v }));
                      }}
                      className="w-12 h-1 bg-white/20 rounded-full appearance-none accent-purple-500"
                    />
                    <button 
                      onClick={() => setMultiviewChannels(prev => {
                        const next = [...prev];
                        next[idx] = null;
                        return next;
                      })}
                      className="p-1 rounded bg-red-500/20 text-red-500 hover:bg-red-500/40"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>

                {/* Slot Action Button (if empty) */}
                {!ch && (
                   <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setShowChannelSelector({ idx })}
                        className="px-6 py-2.5 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-110 active:scale-95 transition-all"
                      >
                        Chọn kênh
                      </button>
                   </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <>
            {active.status === "maintenance" ? (
              <div className="absolute inset-0 w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center p-8 overflow-hidden">
                {/* Background Testcard Pattern */}
                <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
                  <div className="w-full h-full" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #1a1a1a 0, #1a1a1a 1px, transparent 0, transparent 50%)', backgroundSize: '100px 100px' }} />
                  <div className="absolute top-1/2 left-0 w-full h-[1px] bg-red-500/30" />
                  <div className="absolute top-0 left-1/2 w-[1px] h-full bg-red-500/30" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/20 rounded-full" />
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative z-10 text-center space-y-8"
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-5 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                      <Zap className="h-12 w-12 text-amber-500 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-4xl font-bold text-white tracking-tighter uppercase">Kênh đang bảo trì</h3>
                      <p className="text-white/40 font-mono text-sm uppercase tracking-widest">System Status: Maintenance Mode</p>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 backdrop-blur-md p-6 max-w-md rounded-2xl space-y-4">
                    <p className="text-white/70 text-sm leading-relaxed">
                      Kênh truyền hình này hiện đang trong quá trình nâng cấp hệ thống định kỳ. Vui lòng quay lại sau ít phút hoặc xem các kênh khác.
                    </p>
                    <div className="flex items-center justify-center gap-6 pt-2 border-t border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>Signal: Stable</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Update: 85%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-4">
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-8 py-3 bg-white hover:bg-slate-100 text-black rounded-xl text-sm font-bold uppercase tracking-wider transition-all active:translate-y-1 shadow-[2px_2px_0_0_#cbd5e1,4px_4px_10px_0_rgba(0,0,0,0.1)] active:shadow-none flex items-center gap-2 backdrop-blur-md"
                    >
                      <RotateCcw size={16} />
                      Tải lại trang
                    </button>
                    <div className="px-6 py-3 border border-white/20 text-white/60 rounded-xl text-xs font-mono">
                      CODE: MAINTENANCE_503
                    </div>
                  </div>
                </motion.div>

                {/* Corner Accents */}
                <div className="absolute top-8 left-8 font-mono text-[10px] text-white/20 select-none">
                  VPLAY // SYSTEM_CORE_v2.4
                </div>
                <div className="absolute bottom-8 right-8 font-mono text-[10px] text-white/20 select-none">
                  {new Date().toISOString()}
                </div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full"
                autoPlay
                muted={isMuted}
                onClick={togglePlay}
              />
            )}
            
            {streamError && active.status !== "maintenance" && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
                <div className="bg-red-500/20 p-4 rounded-full mb-4 ring-2 ring-red-500/50">
                  <X className="h-10 w-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Lỗi bảo mật (CORS)</h3>
                <p className="text-white/60 text-sm max-w-xs mb-6">
                  {streamError}
                  <br />
                  <span className="text-[10px] mt-2 block text-amber-400 opacity-60">Gợi ý: Luồng phát này chặn xem trực tiếp trên Website. Hãy cài extension "CORS Unblock" hoặc mở link trực tiếp bên dưới.</span>
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button 
                    onClick={() => window.open(active.stream, '_blank')}
                    className="btn-purple-3d px-6 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <ExternalLink size={16} />
                      Xem link gốc
                    </div>
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold transition-all border border-white/10"
                  >
                    Tải lại trang
                  </button>
                </div>
              </div>
            )}
            {/* Tap to Unmute Overlay */}
            {isMuted && isPlaying && !isMaintenance && (
              <button 
                onClick={toggleMute}
                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-black/80 transition-all animate-bounce"
              >
                <VolumeX className="h-4 w-4" />
                CHẠM ĐỂ BẬT TIẾNG
              </button>
            )}
            {!isMaintenance && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-between">
                <div className="p-8 md:p-10 pointer-events-auto">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl flex items-center justify-center">
                         <img src={active.logo} alt={active.name} className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-2xl font-bold tracking-tighter text-white uppercase">{active.name}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/10">{active.category}</span>
                          <div className="flex items-center gap-1 text-[10px] text-white/50 font-bold uppercase tracking-widest">
                             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                             LIVE 4K
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 md:p-10 pointer-events-auto">
                   <div className={`p-4 rounded-[32px] border border-white/10 flex items-center justify-between gap-6 backdrop-blur-3xl shadow-2xl ${liquidGlass === "tinted" ? "bg-white/80" : "bg-black/30"}`}>
                      <div className="flex items-center gap-3">
                         <button onClick={togglePlay} className={`p-4 rounded-2xl transition-all hover:scale-105 active:scale-95 ${liquidGlass === "tinted" ? "bg-black text-white" : "bg-white text-black"}`}>
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                         </button>
                         <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-white/10">
                            <Volume2 size={20} className={liquidGlass === "tinted" ? "text-black" : "text-white"} />
                            <input 
                              type="range" min="0" max="1" step="0.1" 
                              value={volume} onChange={handleVolumeChange}
                              className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-purple-500"
                            />
                         </div>
                      </div>

                      <div className="flex items-center gap-4">
                          {featureFlags.multiview_experimental && (
                            <div className="relative">
                              <button 
                                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                                className={`p-4 rounded-2xl border transition-all ${
                                  isMultiview
                                    ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                                    : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                                }`}
                                title="Multiview"
                              >
                                <LayoutGrid size={20} />
                              </button>
                              <AnimatePresence>
                                {showLayoutMenu && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute bottom-full mb-6 right-0 min-w-[240px] z-50 p-6 space-y-6 ${
                                      isDark ? "popup-3d-dark" : "popup-3d-light"
                                    } ${liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-500"}`}>Enable Multiview</span>
                                      <button 
                                        onClick={toggleMultiview}
                                        className={`w-12 h-6 rounded-full transition-all relative ${isMultiview ? "bg-purple-600" : "bg-slate-700"}`}
                                      >
                                        <motion.div 
                                          animate={{ x: isMultiview ? 26 : 4 }}
                                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                                        />
                                      </button>
                                    </div>
                                    <div className="space-y-3">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-500"}`}>Grid Layout</span>
                                      <div className="grid grid-cols-4 gap-2">
                                        {[2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                          <button 
                                            key={n}
                                            onClick={() => {
                                              setMultiviewCount(n);
                                              if (!isMultiview) setIsMultiview(true);
                                            }}
                                            className={`p-2 rounded-xl text-xs font-bold transition-all ${multiviewCount === n ? "bg-purple-600 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
                                          >
                                            {n}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          )}
                          <button 
                            onClick={() => toggleFavorite(active)}
                            className={`p-4 rounded-2xl border transition-all ${
                              favorites.includes(active.name)
                                ? "bg-red-500/10 border-red-500 text-red-500"
                                : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                            }`}
                          >
                            <Heart size={20} fill={favorites.includes(active.name) ? "currentColor" : "none"} />
                          </button>
                         <button onClick={toggleFullscreen} className={`p-4 rounded-2xl border transition-all ${liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"}`}>
                            <Maximize size={20} />
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CHANNEL INFO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h2 className={`text-4xl font-bold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-950"}`}>
              {active.name}
            </h2>
            {isMaintenance ? (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] px-3 py-1 rounded-full font-bold tracking-widest flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-500"></div>
                ĐANG BẢO TRÌ
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] px-3 py-1 rounded-full font-bold tracking-widest flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>
                ĐANG TRỰC TIẾP
              </div>
            )}
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-1">Đang phát sóng: {active.category}</p>
        </div>
        
        <div className="flex items-center gap-3">
           {featureFlags.multiview_experimental && (
             <button 
               onClick={toggleMultiview}
               className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest ${
                 isMultiview
                   ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                   : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
               }`}
             >
               <LayoutGrid size={14} />
               {isMultiview ? "Thoát Multiview" : "Multiview"}
             </button>
           )}
           <button 
             onClick={() => toggleFavorite(active)}
             className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all font-bold text-[10px] uppercase tracking-widest ${
               favorites.includes(active.name)
                 ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                 : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
             }`}
           >
             <Heart size={14} fill={favorites.includes(active.name) ? "currentColor" : "none"} />
             {favorites.includes(active.name) ? "Đã thích" : "Yêu thích"}
           </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide flex-1">
            {["Tất cả", "VTV", "HTV", "VTVcab", "Thiết yếu", "Địa phương", "Phát thanh", "Hoạt động", "Bảo trì"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 md:px-4 md:py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === type
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                    : isDark
                    ? "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    : "bg-white/10 border-white/20 text-slate-600 hover:bg-white/20"
                } ${liquidGlass ? "backdrop-blur-md" : ""}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Desktop Sort Button */}
            <button
              onClick={() => {
                if (sortOrder === "default") setSortOrder("az");
                else if (sortOrder === "az") setSortOrder("za");
                else setSortOrder("default");
              }}
              className={`hidden md:flex p-3.5 md:p-3 rounded-xl border transition-all items-center gap-2 ${
                isDark 
                  ? "bg-slate-800/50 border-slate-700/50 text-white" 
                  : "bg-white/50 border-white/60 text-slate-900"
              } ${liquidGlass ? "backdrop-blur-md" : ""}`}
              title={sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "Sắp xếp A-Z" : "Sắp xếp Z-A"}
            >
              <Filter className="h-5 w-5" />
              <span className="text-sm font-medium">
                {sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "A-Z" : "Z-A"}
              </span>
            </button>

            {/* Mobile Sort Dropdown */}
            <div className="relative md:hidden flex-1">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className={`w-full p-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  isDark 
                    ? "bg-white/5 border-white/5 text-white" 
                    : "bg-white/10 border-white/20 text-slate-900"
                } ${liquidGlass ? "backdrop-blur-md" : ""}`}
              >
                <Sliders className="h-5 w-5" />
                <span className="text-sm font-bold uppercase tracking-wider">Sort</span>
                <span className="ml-auto text-[10px] opacity-50">
                  {sortOrder === "default" ? "Mặc định" : sortOrder === "az" ? "A-Z" : "Z-A"}
                </span>
              </button>
              
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute top-full left-0 right-0 mt-2 z-50 p-2 border shadow-2xl ${
                      isDark ? "bg-slate-900/95 border-white/10" : "bg-white/95 border-black/5"
                    } ${liquidGlass ? "rounded-2xl backdrop-blur-3xl" : "rounded-xl"}`}
                  >
                    {[
                      { id: "default", label: "Mặc định" },
                      { id: "az", label: "Sắp xếp A-Z" },
                      { id: "za", label: "Sắp xếp Z-A" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortOrder(opt.id as any);
                          setShowSortMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                          sortOrder === opt.id 
                            ? "bg-purple-600 text-white" 
                            : isDark ? "text-white hover:bg-white/5" : "text-slate-900 hover:bg-black/5"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CHANNEL LIST */}
        <div className="space-y-16">
          {filteredCategories.map(cat => (
            <div key={cat} className="space-y-8">
              <div className="flex items-center gap-4 px-2">
                <div className="h-8 w-1.5 bg-purple-500 rounded-full" />
                <div>
                  <h3 className={`text-2xl md:text-3xl font-bold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>{cat}</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                {cat === "Phát thanh" ? (
                  <div className={`col-span-full p-12 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                    isDark ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10" : "border-black/5 bg-black/5 text-slate-500 hover:bg-black/[0.02]"
                  }`}>
                    <div className="p-4 rounded-3xl bg-purple-500/10 text-purple-500">
                      <Sparkles size={32} className="animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl tracking-tighter uppercase mb-1">Coming Soon!</p>
                      <p className="text-xs font-medium opacity-60">Tính năng đang được phát triển để mang lại trải nghiệm âm thanh tốt nhất.</p>
                    </div>
                  </div>
                ) : (
                  filteredChannels.filter(c => c.category === cat).map((ch) => (
                    <ChannelCard 
                      key={`${ch.name}-${ch.stream}`} 
                      ch={ch} 
                      onClick={() => setActive(ch)} 
                      isDark={isDark} 
                      isActive={active.name === ch.name} 
                      favorites={favorites} 
                      toggleFavorite={toggleFavorite} 
                      liquidGlass={liquidGlass}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
          {filteredChannels.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-800/50 mb-4">
                <img 
                  src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
                  alt="Search" 
                  className="h-10 w-10 object-contain" 
                  referrerPolicy="no-referrer" 
                />
              </div>
              <h3 className="text-xl font-bold text-slate-400">Không tìm thấy kênh nào</h3>
              <p className="text-slate-500">Thử tìm kiếm với từ khóa khác</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchPopup({ 
  isDark, 
  searchQuery, 
  setActiveChannel, 
  onClose, 
  favorites, 
  liquidGlass,
  setActiveTab,
  setIsDark,
  setLiquidGlass,
  onLogin,
  onLogout,
  setSortOrder
}: {
  isDark: boolean,
  searchQuery: string,
  setActiveChannel: (ch: typeof channels[0]) => void,
  onClose: () => void,
  favorites: string[],
  liquidGlass: "glassy" | "tinted",
  setActiveTab: (tab: string) => void,
  setIsDark: (val: boolean) => void,
  setLiquidGlass: (val: "glassy" | "tinted") => void,
  onLogin: () => void,
  onLogout: () => void,
  setSortOrder: (val: "az" | "za") => void
}) {
  if (searchQuery.trim() === "") return null;

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemItems = [
    { name: "Trang chủ", type: "tab", icon: Home, action: () => setActiveTab("Trang chủ") },
    { name: "Truyền hình", type: "tab", icon: Tv, action: () => setActiveTab("Truyền hình") },
    { name: "Phát thanh", type: "tab", icon: Radio, action: () => setActiveTab("Phát thanh") },
    { name: "Cài đặt", type: "tab", icon: SettingsIcon, action: () => setActiveTab("Cài đặt") },
    { name: "Hồ sơ", type: "tab", icon: User, action: () => setActiveTab("Hồ sơ") },
    { name: "Chế độ tối", type: "setting", icon: Moon, action: () => setIsDark(!isDark) },
    { name: "Hiệu ứng kính", type: "setting", icon: Layers, action: () => setLiquidGlass(liquidGlass === "glassy" ? "tinted" : "glassy") },
    { name: "Đăng nhập", type: "button", icon: LogIn, action: onLogin },
    { name: "Đăng xuất", type: "button", icon: LogOut, action: onLogout },
    { name: "Sắp xếp A-Z", type: "toggle", icon: Filter, action: () => setSortOrder("az") },
    { name: "Sắp xếp Z-A", type: "toggle", icon: Filter, action: () => setSortOrder("za") },
  ];

  const filteredSystem = systemItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteChannels = channels.filter(ch => favorites.includes(ch.name));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={{ opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`absolute bottom-full mb-8 w-[90vw] md:w-full max-w-[400px] overflow-hidden ${
        isDark ? "popup-3d-dark" : "popup-3d-light"
      } ${
        liquidGlass ? "backdrop-blur-xl" : "backdrop-blur-none"
      }`}
    >
      <div className="p-4 space-y-1 max-h-[60vh] overflow-y-auto">
        {searchQuery.trim() === "" ? (
          <div className="space-y-4">
            {favoriteChannels.length > 0 && (
              <div className="space-y-2">
                <div className="px-4 py-2 flex items-center gap-2">
                  <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                  <p className={`text-[10px] font-bold uppercase tracking-widest text-black/60`}>Kênh yêu thích</p>
                </div>
                {favoriteChannels.map(ch => (
                  <button
                    key={ch.name}
                    onClick={() => { setActiveChannel(ch); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group hover:bg-black/5`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-100 border-slate-200`}>
                      <img src={ch.logo} alt={ch.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm text-black`}>{ch.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/30" />
                  </button>
                ))}
              </div>
            )}
            <div className="py-8 text-center space-y-3 text-black">
              <img 
                src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
                alt="Search" 
                className="w-12 h-12 mx-auto object-contain" 
                referrerPolicy="no-referrer" 
              />
              <p className="text-sm font-bold">Tìm kiếm kênh chương trình</p>
            </div>
          </div>
        ) : (filteredChannels.length > 0 || filteredSystem.length > 0) ? (
          <>
            {filteredSystem.length > 0 && (
              <div className="space-y-1 mb-4">
                <div className="px-4 py-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest text-black/60`}>Hệ thống & Cài đặt</p>
                </div>
                {filteredSystem.map(item => (
                  <button
                    key={item.name}
                    onClick={() => { item.action(); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group hover:bg-black/5`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 bg-slate-100 border-slate-200 text-purple-600`}>
                      <item.icon className="w-6 h-6 fill-current" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm text-black`}>{item.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{item.type === "tab" ? "Chuyển Tab" : "Cài đặt"}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/30" />
                  </button>
                ))}
              </div>
            )}

            {filteredChannels.length > 0 && (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest text-black/60`}>Kênh truyền hình</p>
                </div>
                {filteredChannels.map(ch => (
                  <button
                    key={ch.name}
                    onClick={() => { setActiveChannel(ch); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group hover:bg-black/5`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 bg-slate-100 border-slate-200`}>
                      <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm text-black`}>{ch.name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">{ch.category}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-black/30" />
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center opacity-40 space-y-3 text-black">
            <img 
              src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
              alt="Search" 
              className="w-12 h-12 mx-auto object-contain" 
              referrerPolicy="no-referrer" 
            />
            <p className="text-sm font-medium">Không tìm thấy kết quả nào cho "{searchQuery}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EventsContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: "glassy" | "tinted" }) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`p-6 rounded-full ${isDark ? "bg-white/5" : "bg-black/5"}`}
      >
        <Sparkles className="w-12 h-12 text-purple-500 opacity-20 animate-pulse" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Lưu trữ</h2>
        <p className={`text-sm opacity-50 max-w-xs mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
          Hiện tại chưa có sự kiện nào được lưu trữ. Các sự kiện trực tiếp sẽ xuất hiện tại đây sau khi kết thúc.
        </p>
      </motion.div>
    </div>
  );
}

function MiniPlayer({ 
  channel, 
  isDark, 
  onClose,
  liquidGlass
}: { 
  channel: Channel, 
  isDark: boolean, 
  onClose: () => void,
  liquidGlass: "glassy" | "tinted"
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel.stream) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(channel.stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = channel.stream;
      video.play().catch(() => {
        video.muted = true;
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.stream]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.8, x: 20, y: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed bottom-24 right-8 z-[100] w-64 md:w-80 aspect-video shadow-2xl overflow-hidden border ${
        isDark ? "bg-slate-900 border-white/10" : "bg-white border-slate-200"
      } ${liquidGlass ? "rounded-[32px] backdrop-blur-xl" : "rounded-2xl"}`}
    >
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent z-10 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2">
          <img src={channel.logo} className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[120px]">{channel.name}</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-full bg-black/40 text-white hover:bg-red-500 transition-colors">
          <X size={14} />
        </button>
      </div>
      <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted />
      <div className="absolute inset-0 pointer-events-none border-2 border-white/5 rounded-[inherit]" />
    </motion.div>
  );
}

function ExperimentalContent({ isDark, featureFlags, setFeatureFlags, liquidGlass, loadingTreatment, setLoadingTreatment }: { 
  isDark: boolean, 
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void,
  liquidGlass: "glassy" | "tinted",
  loadingTreatment: string,
  setLoadingTreatment: (val: string) => void
}) {
  const experiments = [
    {
      id: "revamp_processing_loading_circle",
      name: "Revamp Process Animation",
      desc: "Sử dụng vòng lặp tải (loading circle) hoàn toàn mới và đã được cập nhật trong ứng dụng."
    },
    {
      id: "PiP_experimental",
      name: "Picture in Picture",
      desc: "Hiển thị hình phát thu nhỏ của kênh đang xem khi chuyển sang trang khác hoặc cuộn xuống."
    }
  ];

  const treatments = [
    { id: "treatment1", name: "Classic Spinner", desc: "Animation with classic spinning effect." },
    { id: "treatment2", name: "Wavy Blue", desc: "Modern wavy blue loading animation." },
    { id: "treatment3", name: "Basic Spinner", desc: "Clean and simple loading spinner." }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 pb-32">
      <div className={`p-8 rounded-[40px] border-2 transition-all shadow-xl rotate-[-1deg] ${
        isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50 border-amber-200 text-amber-700"
      }`}>
        <div className="flex items-start gap-5">
          <div className={`p-3 rounded-2xl ${isDark ? "bg-amber-500/20" : "bg-amber-100"}`}>
            <AlertCircle size={28} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-black uppercase tracking-tighter">Cảnh báo rủi ro</h4>
            <p className="text-sm font-bold leading-relaxed opacity-90">Các tính năng thử nghiệm có thể chưa ổn định và có thể gây lỗi treo ứng dụng. Chúng tôi khuyến nghị bạn nên sử dụng cẩn thận trên các thiết bị có cấu hình yếu.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)] rotate-3">
            <Flask size={28} />
          </div>
          <div>
            <h2 className={`text-4xl font-black tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>Experimental Labs</h2>
            <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} font-black uppercase tracking-widest`}>BETA FEATURES & CUTTING-EDGE TECH</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {experiments.map((exp) => (
          <div key={exp.id} className="space-y-6">
            <button 
              onClick={() => setFeatureFlags(prev => ({ ...prev, [exp.id]: !prev[exp.id] }))}
              className={`w-full flex flex-col md:flex-row items-center justify-between p-8 rounded-[40px] border-2 transition-all text-left group card-3d ${
                featureFlags[exp.id] 
                  ? "bg-purple-600/90 border-purple-500 text-white shadow-[2px_2px_0_0_#4c1d95,4px_4px_12px_0_rgba(0,0,0,0.3)] backdrop-blur-md -translate-y-0.5" 
                  : isDark ? "btn-3d-dark" : "btn-3d-slate"
              }`}
            >
              <div className="space-y-2 mb-6 md:mb-0">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-2xl uppercase tracking-tighter flex items-center gap-2">
                    {exp.name}
                  </h4>
                  {featureFlags[exp.id] && <CheckCircle2 size={24} className="text-white" />}
                </div>
                <p className={`text-sm ${featureFlags[exp.id] ? "text-white/80" : "text-slate-500"} font-bold max-w-lg leading-relaxed`}>{exp.desc}</p>
                <div className="pt-2">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black font-mono border-2 ${featureFlags[exp.id] ? "bg-amber-400 border-amber-500 text-amber-950" : "bg-amber-100 border-amber-200 text-amber-800"}`}>
                    REF_ID: {exp.id}
                  </span>
                </div>
              </div>
              <div className={`w-16 h-9 rounded-full transition-all relative shrink-0 ${featureFlags[exp.id] ? "bg-white/20" : "bg-slate-700/20"}`}>
                  <motion.div 
                    animate={{ x: featureFlags[exp.id] ? 32 : 6 }}
                    className={`absolute top-1.5 w-6 h-6 rounded-full shadow-md ${featureFlags[exp.id] ? "bg-white" : "bg-slate-400"}`}
                  />
              </div>
            </button>

            {exp.id === "revamp_processing_loading_circle" && featureFlags[exp.id] && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-[40px] border-2 ${isDark ? "bg-slate-900/80 border-white/10" : "bg-white border-slate-200"} space-y-8 shadow-2xl relative overflow-hidden`}
              >
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Settings size={120} />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                    <Settings size={20} className="animate-spin-slow" />
                  </div>
                  <h5 className={`text-sm font-black uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>Ngoại hình vòng lặp tải</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  {treatments.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setLoadingTreatment(t.id)}
                      className={`p-6 rounded-[32px] border-2 transition-all text-left space-y-2 flex flex-col justify-between h-full ${
                        loadingTreatment === t.id 
                          ? "bg-purple-600/90 border-purple-500 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)] backdrop-blur-md translate-y-[-2px]" 
                          : isDark ? "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-50 border-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black uppercase tracking-tight leading-tight">{t.name}</span>
                        {loadingTreatment === t.id && <CheckCircle2 size={16} />}
                      </div>
                      <p className={`text-[10px] leading-relaxed font-bold ${loadingTreatment === t.id ? "text-white/70" : "text-slate-500"}`}>{t.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: "glassy" | "tinted" }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map(doc => doc.data());
        setUsers(usersData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div className="p-8 text-center">Đang tải...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

  const filteredUsers = users.filter(u => u.email !== "sonhuyc2kl@gmail.com");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Quản trị</h2>
      <div className={`rounded-xl border overflow-x-auto ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
        <table className="w-full text-left min-w-[600px]">
          <thead className={`border-b ${isDark ? "border-slate-800 bg-slate-800/50 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
            <tr>
              <th className="p-4 font-medium">Người dùng</th>
              <th className="p-4 font-medium">Ngày tạo</th>
              <th className="p-4 font-medium">Đã xem</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDark ? "divide-slate-800 text-slate-300" : "divide-slate-200 text-slate-700"}`}>
            {filteredUsers.map(u => (
              <tr key={u.uid}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {u.photoURL ? <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"><User className="w-4 h-4 text-slate-600" /></div>}
                    <div className="flex flex-col">
                      <span className="font-medium">{u.displayName || "Chưa có tên"}</span>
                      <span className="text-xs opacity-50">{u.email}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : ""}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {u.watchedChannels && u.watchedChannels.length > 0 ? (
                      u.watchedChannels.map((chName: string) => (
                        <span key={chName} className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
                          {chName}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs opacity-30 font-medium">Chưa xem kênh nào</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={3} className="p-4 text-center text-slate-500">Chưa có người dùng nào khác.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function UpdateLogsContent({ isDark, onBack, featureFlags, loadingTreatment }: { isDark: boolean, onBack: () => void, featureFlags?: any, loadingTreatment: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [logSearchQuery, setLogSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    const getLoadingUrl = () => {
      if (!featureFlags?.revamp_processing_loading_circle) {
        return "https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif";
      }
      switch (loadingTreatment) {
        case "treatment1": return "https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original";
        case "treatment2": return "https://cdn.pixabay.com/animation/2025/10/01/12/56/12-56-37-235_512.gif";
        case "treatment3": return "https://cdn.pixabay.com/animation/2025/09/06/21/34/21-34-46-885_512.gif";
        default: return "https://cdn.pixabay.com/animation/2023/10/08/03/19/03-19-26-213_512.gif";
      }
    };

    const loadingUrl = getLoadingUrl();

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <img 
          src={loadingUrl} 
          alt="Loading" 
          className={`w-14 h-14 ${
            (!featureFlags?.revamp_processing_loading_circle && isDark) ? "filter brightness-0 invert" : 
            ((loadingTreatment === "treatment1" || loadingTreatment === "treatment3") && !isDark && featureFlags?.revamp_processing_loading_circle) ? "filter grayscale brightness-0" : ""
          }`}
        />
        <span className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${isDark ? "text-white/40" : "text-slate-400"}`}>
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  const logs = [
    {
      id: 'dev-26510',
      version: 'Vplay Dev - Build 26510',
      tag: '🧪',
      type: '',
      sections: [
        {
          title: '🧪 EXPERIMENTAL LABS',
          items: [
            'Thêm tab Experimental mới (icon bình thuốc)',
            'Thêm experiment: Revamp Process Animation - Cập nhật giao diện vòng lặp tải mới'
          ],
          color: 'text-purple-500'
        },
        {
          title: '🎨 USER INTERFACE',
          items: [
            'Cấu trúc lại trang Cài đặt: Phần Thông tin giờ được đặt cạnh Hồ sơ và Cộng đồng',
            'Cập nhật giao diện thẻ Thông tin đẹp hơn với Build ID và Status indicator'
          ],
          color: 'text-blue-500'
        }
      ]
    },
    {
      id: 'dev-26504',
      version: 'Vplay Dev - Build 26504',
      tag: '🐱',
      type: '',
      sections: [
        {
          title: '✨ OUT-OF-BOX EXPERIENCE',
          items: [
            'Đã thêm màn hình OOBE cài đặt khởi đầu',
            'Có thể force launch OOBE trong cài đặt mục Developer Options'
          ],
          color: 'text-purple-500'
        },
        {
          title: '🔧 SETTINGS',
          items: [
            'Đã thêm Link Discord của The Waves',
            'Đã loại bỏ một số thành phần cũ và không cần thiết',
            'Firebase Debug và Changelogs (trước kia là Update Logs) đẩy xuống mục Developer Options'
          ],
          color: 'text-blue-500'
        },
        {
          title: '🧪 FEATURES LAB',
          items: [
            'Đã đổi tên Features Flag thành Features Lab',
            'Đã đổi tên các Flags thành các Labs',
            'Features Lab có thể kích hoạt từ OOBE'
          ],
          color: 'text-amber-500'
        }
      ]
    },
    {
      id: 'dev-26470',
      version: 'Vplay Dev - Build 26470',
      tag: '🐱',
      type: '',
      sections: [
        {
          title: '✨ FEATURES',
          items: [
            'Thêm UPDATE LOGS trong trang settings để xem toàn bộ lịch sử và nội dung của các bản cập nhật Vplay'
          ],
          color: 'text-purple-500'
        },
        {
          title: '🎨 USER INTERFACE',
          items: [
            'Cập nhật lại sidebar: Đối với máy tính hoặc máy tính bảng, sidebar có thiết kế "lơ lửng" và blur nhẹ / Đối với thiết bị di động, khi bật Desktop Interface cũng có thể sử dụng được sidebar ẩn dưới dạng hamburger menu',
            'Cập nhật lại trang settings',
            'Cập nhật logo Vplay',
            'Sidebar search đã hoạt động trở lại',
            'LTR sidebar và Channel pinning (chỉ cho Desktop Interface) chính thức roll-out, ko còn nằm trong Feature Flag'
          ],
          color: 'text-blue-500'
        },
        {
          title: '🚩 FEATURES LAB',
          items: [
            'Giờ nằm trực tiếp dưới cuối cùng của trang settings',
            'Đã thêm lại flag "Multiview": Xem nhiều kênh truyền hình cùng một thời điểm',
            'Đã thêm flag "Reduce Animation": Giảm thiểu hiệu ứng chuyển đổng trên trang web. Thích hợp cho các thiết bị yếu'
          ],
          color: 'text-amber-500'
        }
      ]
    },
    {
      id: 'dev-26467',
      version: 'Vplay Dev - Build 26467',
      tag: '🐱',
      type: '',
      sections: [
        {
          title: '📝 DEV NOTE',
          items: [
            'Vì một số lỗi nên project đã bị reset lại về phiên bản chính thức mới nhất',
            'Project sẽ bị reset lại kể từ bản chính thức mới nhất (giống Windows Longhorn reset lại á :))',
            'VTV1 và VTV9 ko xem dc (nhờ OTA fix sau)'
          ],
          color: 'text-red-500'
        },
        {
          title: '🎨 USER INTERFACE',
          items: [
            'Thêm slogan của Vplay vào phần splash screen',
            'Đã tái cấu trúc lại Home page, Phát sóng và Cài đặt nhìn layout đẹp hơn',
            'Đã thêm option Interface',
            'Sẽ có 2 tuỳ chọn: Desktop Interface (khuyến khích sử dụng trên máy tính) và Touch Interface (khuyến khích sử dụng cho các thiết bị cảm ứng)',
            'Khi bật Desktop Interface trên thiết bị cảm ứng, thay vì navigation bar bị kéo dãn thì bây giờ sẽ ẩn dưới dạng hamburger menu',
            'Đã thêm option Liquid Glass (chỉ sử dụng cho Touch Interface)',
            'Giống iOS 26, sẽ có 2 tuỳ chọn: Glassy và Tinted',
            'Glassy: Nav bar sẽ trong suốt hơn',
            'Tinted: Nav bar sẽ ít trong suốt hơn'
          ],
          color: 'text-blue-500'
        },
        {
          title: '🚩 FEATURES LAB',
          items: [
            'TOÀN BỘ trang features flag do project bị reset nên đã bị loại bỏ (trong đó có cả Multiview)',
            'Sidebar/Desktop Experience trở lại như phiên bản chính thức'
          ],
          color: 'text-amber-500'
        }
      ]
    }
  ] as { id: string, version: string, tag: string, type: string, content?: string, sections?: { title: string, items: string[], color: string }[] }[];

  const filteredLogs = logs.filter(log => 
    log.version.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
    (log.sections?.some(s => s.items.some(i => i.toLowerCase().includes(logSearchQuery.toLowerCase())))) ||
    (log.content && log.content.toLowerCase().includes(logSearchQuery.toLowerCase()))
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 max-w-4xl mx-auto w-full pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className={`p-2 rounded-xl transition-all ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className={`text-3xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Changelogs</h2>
        </div>

          <div className={`relative group min-w-[240px] rounded-full overflow-hidden transition-all ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isDark ? "text-white/20 group-focus-within:text-purple-400" : "text-slate-400 group-focus-within:text-purple-600"}`} size={14} />
            <input 
              value={logSearchQuery}
              onChange={e => setLogSearchQuery(e.target.value)}
              placeholder="Tìm kiếm..."
              className={`w-full pl-10 pr-4 py-3 text-xs bg-transparent focus:outline-none transition-all ${
                isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
              }`}
            />
            <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_8px_rgba(168,85,247,0.4)]`} />
          </div>
      </div>

      <div className="space-y-16">
        {/* KHÁC BIỆT GIỮA CÁC PHIÊN BẢN vplay beta */}
        {logSearchQuery === "" && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 px-1">
               <h3 className={`text-sm font-bold uppercase tracking-[0.2em] ${isDark ? "text-white/40" : "text-slate-400"}`}>KHÁC BIỆT GIỮA CÁC PHIÊN BẢN vplay beta</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"} space-y-3`}>
                <div className="flex items-center gap-2 text-green-500">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Vplay Dev</span>
                </div>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed font-medium`}>
                  Thử nghiệm, vẫn khá lỗi nhưng tính năng hoàn thiện hơn so với Canary. Được cập nhật thường xuyên, tính năng ổn định sẽ được đưa vào dưới Features Lab.
                </p>
              </div>
              <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"} space-y-3`}>
                <div className="flex items-center gap-2 text-yellow-500">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-xs font-bold uppercase tracking-widest">Vplay Canary</span>
                </div>
                <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed font-medium`}>
                  Thử nghiệm, nhiều lỗi, tính năng test sơ sài, có thể hỏng hoặc crash. Cập nhật không định kỳ, sử dụng cho mục đích test kỹ thuật.
                </p>
              </div>
            </div>
          </section>
        )}

        {filteredLogs.length > 0 ? filteredLogs.map((log) => (
          <section key={log.id} className="space-y-6">
            <div className="flex items-center gap-3">
               <div className={`w-10 h-10 rounded-2xl ${log.id.includes('dev') ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'} flex items-center justify-center`}>
                 <span className="text-xl">{log.tag}</span>
               </div>
               <div>
                 <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{log.version}</h3>
               </div>
            </div>
            
            {log.sections ? (
              <div className={`p-6 md:p-8 rounded-[32px] border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"} space-y-8`}>
                {log.sections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <h4 className={`text-xs font-bold ${section.color} uppercase tracking-[0.2em]`}>{section.title}</h4>
                    <ul className={`text-sm space-y-3 ${isDark ? "text-slate-300" : "text-slate-600"} font-medium`}>
                      {section.items.map((item, iIdx) => (
                        <li key={iIdx} className="flex gap-2">
                          <span className={`mt-1.5 h-1 w-1 rounded-full bg-current shrink-0 ${section.color}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-6 md:p-8 rounded-[32px] border ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"}`}>
                <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"} font-medium`}>
                  {log.content}
                </p>
              </div>
            )}
          </section>
        )) : (
          <div className="p-12 text-center text-slate-500 text-[10px] font-semibold uppercase tracking-[0.3em]">
            Không tìm thấy phiên bản phù hợp
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsContent({ 
  isDark, 
  setIsDark, 
  isDev, 
  setIsDev, 
  featureFlags,
  setFeatureFlags,
  liquidGlass, 
  setLiquidGlass,
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  isSidebarLocked,
  setIsSidebarLocked,
  isPinningEnabled,
  setIsPinningEnabled,
  user,
  userData,
  setUserData,
  onAlert,
  onLogin,
  onUpdateLogsClick,
  onResetOnboarding,
  favorites,
  bypassed
}: { 
  isDark: boolean, 
  setIsDark: (val: boolean) => void, 
  isDev: boolean, 
  setIsDev: (val: boolean) => void,
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void,
  liquidGlass: "glassy" | "tinted",
  setLiquidGlass: (val: "glassy" | "tinted") => void,
  useSidebar: boolean,
  setUseSidebar: (val: boolean) => void,
  isSidebarRight: boolean,
  setIsSidebarRight: (val: boolean) => void,
  isSidebarLocked: boolean,
  setIsSidebarLocked: (val: boolean) => void,
  isPinningEnabled: boolean,
  setIsPinningEnabled: (val: boolean) => void,
  user: FirebaseUser | null,
  userData: any,
  setUserData: any,
  onAlert: (title: string, msg: string) => void,
  onLogin: () => void,
  onUpdateLogsClick: () => void,
  onResetOnboarding: () => void,
  favorites: string[],
  bypassed?: boolean
}) {
  const [name, setName] = useState(userData?.displayName || user?.displayName || "");
  const [avatar, setAvatar] = useState(userData?.photoURL || user?.photoURL || "");
  const [saving, setSaving] = useState(false);
  const [flagSearch, setFlagSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(userData?.displayName || user?.displayName || "");
    setAvatar(userData?.photoURL || user?.photoURL || "");
  }, [user, userData]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setAvatar(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user && !bypassed) return;
    setSaving(true);
    try {
      const isDataUrl = avatar.startsWith('data:');
      const profileUpdates: any = { displayName: name };
      if (!isDataUrl) {
        profileUpdates.photoURL = avatar;
      }
      await updateProfile(user, profileUpdates);
      
      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        photoURL: avatar
      }, { merge: true });
      
      setUserData({ ...userData, displayName: name, photoURL: avatar });
      onAlert("Thành công", "Đã cập nhật hồ sơ của bạn!");
    } catch (e: any) {
      console.error(e);
      onAlert("Lỗi", "Không thể cập nhật hồ sơ: " + e.message);
    }
    setSaving(false);
  };

  const toggleFlag = (id: string) => {
    setFeatureFlags(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-32 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch lg:items-start">
        {/* Left Column - Information Section (Large card) */}
        <div className={`p-8 rounded-[40px] border flex flex-col justify-between relative overflow-hidden h-full ${isDark ? "border-white/5 bg-slate-900/50 shadow-2xl" : "border-black/5 bg-white shadow-xl"} ${liquidGlass ? "backdrop-blur-xl" : ""}`}>
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/5 blur-[100px] -mr-32 -mt-32" />
           
           <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                  <Info size={22} />
                </div>
                <div>
                  <h3 className={`font-bold text-xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Thông tin</h3>
                  <p className="text-[9px] opacity-30 font-black tracking-widest uppercase">System Core Version</p>
                </div>
              </div>

              <div className="flex flex-col items-center py-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600/10 blur-3xl rounded-full scale-125" />
                  <img 
                    src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                    className="w-32 h-32 object-contain relative z-10 drop-shadow-2xl"
                    alt="Vplay App Logo"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-center mt-6 space-y-1">
                  <h2 className="text-2xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    SUMMER 2026
                  </h2>
                  <p className={`text-[10px] font-bold tracking-[0.4em] ${isDark ? "text-white/40" : "text-slate-400"}`}>STABLE UPDATE v4.0</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                 <div className={`p-4 rounded-2xl border flex items-center justify-between group transition-all hover:border-purple-500/30 ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                        <Activity size={18} />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Release Version</p>
                       <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>SMR - 2026.04</p>
                     </div>
                   </div>
                   <span className="px-3 py-1 bg-green-500/20 text-green-500 text-[10px] font-black rounded-lg">STABLE</span>
                 </div>

                 <div className={`p-4 rounded-2xl border flex items-center justify-between group transition-all hover:border-amber-500/30 ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-100"}`}>
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Shield size={18} />
                     </div>
                     <div>
                       <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Build Signature</p>
                       <p className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>AIS-26510-PROD</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                     <span className="text-amber-500 text-[10px] font-black">ENCRYPTED</span>
                   </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Column - Profile and Community */}
        <div className="flex flex-col gap-8">
          {/* Profile Section */}
          <div className={`p-10 rounded-[48px] border flex flex-col ${isDark ? "border-white/5 bg-slate-900 shadow-2xl" : "border-black/5 bg-white shadow-xl"} ${liquidGlass ? "backdrop-blur-xl" : ""}`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-500">
                <User size={24} />
              </div>
              <h3 className={`font-bold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Hồ sơ</h3>
            </div>

            {!user && !bypassed ? (
              <div className="flex flex-col items-center justify-center text-center gap-6 py-4">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-white shadow-inner"}`}>
                  <User className="w-12 h-12 text-slate-400 opacity-20" />
                </div>
                <div className="space-y-1">
                  <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Chưa đăng nhập</p>
                  <p className="text-xs text-slate-500 font-medium">Đăng nhập để đồng bộ dữ liệu của bạn</p>
                </div>
              <button 
                onClick={onLogin}
                className="btn-purple-3d w-full"
              >
                Đăng nhập ngay
              </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-125" />
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white/10 relative z-10 shadow-2xl" referrerPolicy="no-referrer" />
                    ) : (
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 relative z-10 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-white shadow-inner"}`}>
                        <User className="w-12 h-12 text-slate-400 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <Camera className="text-white w-6 h-6" />
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 ml-2">Display Name</label>
                      <div className={`relative group rounded-[20px] overflow-hidden transition-all ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                        <input 
                          value={name} 
                          onChange={e => setName(e.target.value)} 
                          placeholder="Tên của bạn..."
                          className={`w-full px-6 py-4 text-sm font-bold bg-transparent outline-none transition-all ${
                            isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                          }`} 
                        />
                        <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSave} 
                        disabled={saving}
                        className="btn-purple-3d flex-1 text-[10px] disabled:opacity-50 disabled:active:top-[4px]"
                      >
                        {saving ? "..." : "Lưu thay đổi"}
                      </button>
                      <button 
                        onClick={() => signOut(auth)}
                        className={`p-4 rounded-2xl border transition-all active:translate-y-1 ${isDark ? "bg-red-500/10 border-red-500/10 text-red-500" : "bg-red-50 border-red-100 text-red-600 shadow-[2px_2px_0_0_rgba(239,68,68,0.2),4px_4px_8px_0_rgba(239,68,68,0.1)] active:shadow-none backdrop-blur-md"}`}
                      >
                        <LogOut size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Community Section */}
          <div className={`p-10 rounded-[48px] border flex flex-col justify-between ${isDark ? "border-white/5 bg-slate-900 shadow-2xl" : "border-black/5 bg-white shadow-xl"} ${liquidGlass ? "backdrop-blur-xl" : ""}`}>
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-500">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Cộng đồng</h3>
                    <p className="text-[10px] opacity-40 font-mono tracking-[0.3em]">JOIN THE COMMUNITY</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <a 
                  href="https://discord.gg/CNKFTUBSty" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between p-6 rounded-[32px] border transition-all active:scale-[0.98] group ${
                    isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-slate-100 shadow-sm outline-none"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                      <MessageSquare size={28} />
                    </div>
                    <div>
                      <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>The Waves</h4>
                      <p className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"} font-black uppercase tracking-[0.2em] leading-none mt-2`}>Cộng đồng Discord chính thức</p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="text-slate-500 group-hover:translate-x-2 transition-transform" />
                </a>

                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(num => (
                    <a 
                      key={num}
                      href={`https://www.youtube.com/@ota${num === 1 ? 'one' : num === 2 ? 'two' : num === 3 ? 'three' : 'four'}fr253`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`flex items-center gap-3 p-5 rounded-[28px] border text-xs font-black transition-all group ${
                        isDark ? "bg-white/5 border-white/5 hover:bg-white/10 text-slate-300" : "bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-600 shadow-sm"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Play size={12} fill="currentColor" />
                      </div>
                      <span className="uppercase tracking-widest">Youtube #{num}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance & Experience - Full Width */}
      <div className={`p-10 rounded-[48px] border flex flex-col transition-all w-full mt-8 ${isDark ? "border-white/5 bg-slate-900 shadow-2xl" : "border-black/5 bg-white shadow-xl"} ${liquidGlass ? "backdrop-blur-xl" : ""}`}>
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500">
            <Palette size={28} />
          </div>
          <div>
            <h3 className={`font-bold text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Giao diện & Trải nghiệm</h3>
            <p className="text-[10px] text-slate-500 font-black tracking-[0.3em] uppercase mt-1">Customize your vision</p>
          </div>
        </div>

        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Theme & Animation */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Sun size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Chủ đề hệ thống</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsDark(false)}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 group ${!isDark ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <Sun size={24} className={!isDark ? "text-white" : "text-slate-400 group-hover:text-amber-500"} />
                    <span className="text-sm font-black uppercase tracking-widest">Sáng</span>
                  </button>
                  <button 
                    onClick={() => setIsDark(true)}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 group ${isDark ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <Moon size={24} className={isDark ? "text-white" : "text-slate-400 group-hover:text-purple-400"} />
                    <span className="text-sm font-black uppercase tracking-widest">Tối</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Zap size={14} className="text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Chuyển động</span>
                </div>
                <button 
                  onClick={() => setFeatureFlags(prev => ({ ...prev, disable_animation: !prev.disable_animation }))}
                  className={`w-full p-6 rounded-[32px] border transition-all flex items-center justify-between group ${featureFlags.disable_animation ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                >
                  <div className="flex items-center gap-4">
                    <Zap size={24} className={featureFlags.disable_animation ? "text-white" : "text-slate-400 group-hover:text-purple-500"} />
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-wider">Giảm chuyển động</p>
                      <p className={`text-[10px] font-bold ${featureFlags.disable_animation ? "text-white/60" : "text-slate-500"}`}>Khuyên dùng cho các thiết bị cấu hình yếu</p>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full transition-all relative ${featureFlags.disable_animation ? "bg-white/20" : isDark ? "bg-white/10" : "bg-slate-200"}`}>
                     <motion.div 
                       animate={{ x: featureFlags.disable_animation ? 24 : 4 }}
                       className={`absolute top-1 w-5 h-5 rounded-full shadow-md ${featureFlags.disable_animation ? "bg-white" : "bg-slate-400"}`}
                     />
                  </div>
                </button>
              </div>
            </div>

            {/* Layout & Glass */}
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Monitor size={14} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Kiểu giao diện</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setUseSidebar(true)}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 group ${useSidebar ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <Monitor size={24} className={useSidebar ? "text-white" : "text-slate-400 group-hover:text-blue-400"} />
                    <span className="text-sm font-black uppercase tracking-widest">Desktop</span>
                  </button>
                  <button 
                    onClick={() => setUseSidebar(false)}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 group ${!useSidebar ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <Navigation size={24} className={!useSidebar ? "text-white" : "text-slate-400 group-hover:text-purple-400"} />
                    <span className="text-sm font-black uppercase tracking-widest">Touch Mode</span>
                  </button>
                </div>
              </div>

              <div className={`space-y-4 ${useSidebar ? "opacity-30 grayscale cursor-not-allowed" : ""}`}>
                <div className="flex items-center gap-2 px-1">
                  <Droplet size={14} className="text-cyan-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Liquid Glass Effect</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => !useSidebar && setLiquidGlass("glassy")}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 ${liquidGlass === "glassy" ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <Droplet size={24} className={liquidGlass === "glassy" ? "text-white" : "text-slate-400"} />
                    <span className="text-sm font-black uppercase tracking-widest">Glassy</span>
                  </button>
                  <button 
                    onClick={() => !useSidebar && setLiquidGlass("tinted")}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 ${liquidGlass === "tinted" ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <div className={`w-3 h-3 rounded-full mt-2 ${liquidGlass === "tinted" ? "bg-white shadow-[0_0_10px_white]" : "bg-slate-600"}`} />
                    <span className="text-sm font-black uppercase tracking-widest">Tinted</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Advanced (Desktop Only) */}
          <div className="pt-10 border-t border-white/5 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <LayoutTemplate size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Vị trí Sidebar</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsSidebarRight(false)}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 group ${!isSidebarRight ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <LayoutTemplate size={24} className={!isSidebarRight ? "text-white" : "text-slate-400"} />
                    <span className="text-sm font-black uppercase tracking-widest">Bên Trái</span>
                  </button>
                  <button 
                    onClick={() => setIsSidebarRight(true)}
                    className={`p-6 rounded-[32px] border transition-all flex flex-col gap-3 group ${isSidebarRight ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                  >
                    <LayoutPanelLeft size={24} className={isSidebarRight ? "text-white" : "text-slate-400"} />
                    <span className="text-sm font-black uppercase tracking-widest">Bên Phải</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Pin size={14} className="text-pink-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Ghim Kênh</span>
                </div>
                <button 
                  onClick={() => setIsPinningEnabled(!isPinningEnabled)}
                  className={`w-full p-6 rounded-[32px] border transition-all flex items-center justify-between group ${isPinningEnabled ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                >
                  <div className="flex items-center gap-4">
                    <Pin size={24} className={isPinningEnabled ? "text-white" : "text-slate-400 group-hover:text-pink-500"} />
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-wider">Hiển thị kênh ghim</p>
                      <p className={`text-[10px] font-bold ${isPinningEnabled ? "text-white/60" : "text-slate-500"}`}>Truy cập nhanh kênh yêu thích trên Sidebar</p>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full transition-all relative ${isPinningEnabled ? "bg-white/20" : isDark ? "bg-white/10" : "bg-slate-200"}`}>
                     <motion.div 
                       animate={{ x: isPinningEnabled ? 24 : 4 }}
                       className={`absolute top-1 w-5 h-5 rounded-full shadow-md ${isPinningEnabled ? "bg-white" : "bg-slate-400"}`}
                     />
                  </div>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <Lock size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Kích thước Sidebar</span>
                </div>
                <button 
                  onClick={() => setIsSidebarLocked(!isSidebarLocked)}
                  className={`w-full p-6 rounded-[32px] border transition-all flex items-center justify-between group ${isSidebarLocked ? "btn-vibrant-3d shadow-none" : isDark ? "btn-3d-dark" : "btn-3d-slate"}`}
                >
                  <div className="flex items-center gap-4">
                    <Lock size={24} className={isSidebarLocked ? "text-white" : "text-slate-400 group-hover:text-amber-500"} />
                    <div className="text-left">
                      <p className="text-sm font-black uppercase tracking-wider">Khóa sidebar</p>
                      <p className={`text-[10px] font-bold ${isSidebarLocked ? "text-white/60" : "text-slate-500"}`}>Khóa kích thước mặc định (280px)</p>
                    </div>
                  </div>
                  <div className={`w-12 h-7 rounded-full transition-all relative ${isSidebarLocked ? "bg-white/20" : isDark ? "bg-white/10" : "bg-slate-200"}`}>
                     <motion.div 
                       animate={{ x: isSidebarLocked ? 24 : 4 }}
                       className={`absolute top-1 w-5 h-5 rounded-full shadow-md ${isSidebarLocked ? "bg-white" : "bg-slate-400"}`}
                     />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-12 text-center pb-24">
        <button 
          onClick={onResetOnboarding}
          className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:opacity-100 ${isDark ? "text-white/20 hover:text-white" : "text-black/20 hover:text-black"}`}
        >
          Đặt lại hướng dẫn người dùng
        </button>
      </div>
    </div>
  );
}


function AuthModal({ isOpen, onClose, isDark, liquidGlass, setIsDev, setUserData, featureFlags }: { isOpen: boolean, onClose: () => void, isDark: boolean, liquidGlass: "glassy" | "tinted", setIsDev: (v: boolean) => void, setUserData: (d: any) => void, featureFlags?: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if ((username === "special_guest" && password === "specialguest123") || (username === "vplaybeta" && password === "vplaybeta")) {
      setLoading(true);
      // Simulate login for special guest
      setTimeout(() => {
        setIsDev(true);
        setUserData({
          uid: "vplaybeta_uid",
          email: "vplaybeta@vplay.vn",
          displayName: "Vplay Beta Guest",
          role: "user"
        });
        onClose();
        setLoading(false);
      }, 1000);
      return;
    }

    if (!isForgotPassword && !isLogin && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    if (!isForgotPassword && username.length < 3) {
      setError("Tên đăng nhập phải có ít nhất 3 ký tự.");
      return;
    }

    setLoading(true);
    try {
      const email = username.includes('@') ? username : `${username}@vplay.vn`;
      
      if (isForgotPassword) {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.");
      } else if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else {
        if (password.length < 6) {
          setError("Mật khẩu phải có ít nhất 6 ký tự.");
          setLoading(false);
          return;
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: username.split('@')[0] });
        onClose();
      }
    } catch (err: any) {
      const code = err.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError("Tên đăng nhập hoặc mật khẩu không chính xác.");
      } else if (code === 'auth/email-already-in-use') {
        setError("Tên đăng nhập hoặc email này đã được sử dụng.");
      } else if (code === 'auth/invalid-email') {
        setError("Định dạng email không hợp lệ.");
      } else if (code === 'auth/weak-password') {
        setError("Mật khẩu quá yếu, vui lòng chọn mật khẩu phức tạp hơn.");
      } else if (code === 'auth/operation-not-allowed') {
        setError("Đăng nhập chưa được kích hoạt trong hệ thống.");
      } else if (code === 'auth/too-many-requests') {
        setError("Tài khoản bị tạm khóa do đăng nhập sai quá nhiều lần. Vui lòng thử lại sau.");
      } else {
        console.error("Auth System Error:", err);
        setError("Đã có lỗi xảy ra: " + (err.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isForgotPassword) return "Quên mật khẩu";
    return isLogin ? "Đăng nhập" : "Đăng ký";
  };

  const getDescription = () => {
    if (isForgotPassword) return "Nhập email hoặc tên đăng nhập để nhận liên kết đặt lại mật khẩu.";
    return "Tận hưởng và trải nghiệm đầy đủ các tính năng của Vplay ngay hôm nay!";
  };

  const inputClasses = `w-full px-6 py-3.5 bg-transparent outline-none transition-all ${
    isDark 
      ? "text-white placeholder-white/20" 
      : "text-slate-900 placeholder-slate-400"
  }`;

  const inputContainerClasses = `relative group rounded-full overflow-hidden transition-all ${
    isDark ? "bg-white/5" : "bg-black/5"
  }`;

  const labelClasses = `text-[10px] font-bold uppercase tracking-wider opacity-50 ml-4 ${
    isDark ? "text-white" : "text-slate-900"
  }`;

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        console.error("Google Auth Error:", err);
      }
      
      if (err.code === 'auth/popup-blocked') {
        setError("Cửa sổ đăng nhập bị chặn. Vui lòng cho phép hiện popup.");
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, ignore
      } else {
        setError("Lỗi đăng nhập Google: " + (err.message || "Vui lòng thử lại sau."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LiquidModal 
      isOpen={isOpen} 
      onClose={onClose} 
      isDark={isDark} 
      title={getTitle()}
      description={getDescription()}
      liquidGlass={liquidGlass}
    >
      { (
        <div className="space-y-4">
          
        <div className="flex items-center gap-4 py-2">
          <div className={`flex-1 h-[1px] ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
          <span className="text-[10px] font-bold uppercase opacity-30">Hoặc</span>
          <div className={`flex-1 h-[1px] ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-2xl text-xs font-medium text-center"
          >
            {success}
          </motion.div>
        )}
        <div className="space-y-1">
          <label className={labelClasses}>Tên đăng nhập / Email</label>
          <div className={inputContainerClasses}>
            <input 
              required 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className={inputClasses} 
              placeholder="Nhập tên đăng nhập hoặc email..." 
            />
            <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
          </div>
        </div>
        {!isForgotPassword && (
          <>
            <div className="space-y-1">
              <label className={labelClasses}>Mật khẩu</label>
              <div className={inputContainerClasses}>
                <input 
                  required 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className={inputClasses} 
                  placeholder="Nhập mật khẩu..." 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
              </div>
            </div>
            {!isLogin && (
              <div className="space-y-1">
                <label className={labelClasses}>Xác nhận mật khẩu</label>
                <div className={inputContainerClasses}>
                  <input 
                    required 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className={inputClasses} 
                    placeholder="Nhập lại mật khẩu..." 
                  />
                  <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
                </div>
              </div>
            )}
          </>
        )}
        
        {isLogin && !isForgotPassword && (
          <div className="text-right px-4">
            <button 
              type="button" 
              onClick={() => setIsForgotPassword(true)}
              className="text-[11px] font-bold text-purple-500 hover:underline"
            >
              Quên mật khẩu?
            </button>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading} 
          className="btn-purple-3d w-full mt-2 disabled:opacity-50 disabled:active:top-0"
        >
          {loading ? "..." : (isForgotPassword ? "Xác nhận" : (isLogin ? "Đăng nhập" : "Đăng ký"))}
        </button>
      </form>
        <div className="mt-6 flex flex-col gap-3">
          {isForgotPassword ? (
            <button type="button" onClick={() => setIsForgotPassword(false)} className="text-purple-500 text-xs font-bold hover:underline">
              Quay lại đăng nhập
            </button>
          ) : (
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-purple-500 text-xs font-bold hover:underline">
              {isLogin ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
            </button>
          )}
        </div>
      </div>
    )}
  </LiquidModal>
);
}

function SearchBar({ isDark, query, setQuery, onClose, liquidGlass }: { isDark: boolean, query: string, setQuery: (q: string) => void, onClose: () => void, liquidGlass: "glassy" | "tinted" }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const startVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Không thể nhận diện giọng nói");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognition.start();
  };

  const isGlassy = liquidGlass === "glassy";
  const iconColor = isGlassy ? "text-white" : "text-black";
  const placeholderColor = isGlassy ? "placeholder-white/60" : "placeholder-black/60";
  const textColor = isGlassy ? "text-white" : "text-black";

  return (
    <div className={`flex items-center gap-1 md:gap-4 px-0 md:px-6 py-2 h-14 md:h-16 w-full max-w-4xl relative group rounded-2xl overflow-hidden transition-all ${isGlassy ? "bg-white/5" : "bg-black/5"}`}>
      <div className="flex items-center gap-1 md:gap-2 flex-1">
        <Search className={`h-6 w-6 ${iconColor} flex-shrink-0 transition-colors ${isDark ? "group-focus-within:text-slate-100" : "group-focus-within:text-slate-600"}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search or use commands"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`flex-1 bg-transparent border-none outline-none text-lg font-medium ${textColor} ${placeholderColor}`}
        />
      </div>
      <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isGlassy ? "bg-white/20" : "bg-black/10"} ${isDark ? "group-focus-within:bg-slate-100" : "group-focus-within:bg-slate-400"} group-focus-within:shadow-[0_0_15px_rgba(255,255,255,0.4)]`} />
      <div className="flex items-center gap-4">
        <button 
          onClick={startVoiceSearch}
          className={`p-2 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : `${iconColor} hover:opacity-70`}`}
          title="Đang nghe..."
        >
          <Mic className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

function ProtectedContent({ children, user, onLogin, isDark, isDev, liquidGlass, bypassed }: { children: ReactNode, user: any, onLogin: () => void, isDark: boolean, isDev?: boolean, liquidGlass: "glassy" | "tinted", bypassed?: boolean }) {
  if (!user && !isDev && !bypassed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-6 ${liquidGlass ? "rounded-full" : "rounded-xl"} ${isDark ? "bg-purple-500/10" : "bg-purple-50"}`}
        >
          <Lock className={`h-12 w-12 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
        </motion.div>
        <div className="space-y-2">
          <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Đăng nhập</h2>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} max-w-md mx-auto`}>
            Tận hưởng và trải nghiệm đầy đủ các tính năng của Vplay ngay hôm nay!
          </p>
        </div>
        <button
          onClick={onLogin}
          className={`px-8 py-3 font-bold transition-all hover:scale-105 active:scale-95 ${
            liquidGlass ? "rounded-2xl" : "rounded-lg"
          } ${
            isDark 
              ? "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]" 
              : "bg-purple-500 hover:bg-purple-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          }`}
        >
          Đăng nhập
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

function OnboardingWizard({ 
  onComplete,
  onLogin,
  isDark: currentIsDark
}: { 
  onComplete: (config: any) => void,
  onLogin: () => void,
  isDark: boolean
}) {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState({
    isDark: false, // OOBE uses light mode by default
    useSidebar: false,
    liquidGlass: "glassy",
    isSidebarRight: false,
    isPinningEnabled: false,
    featureFlags: { multiview_experimental: false, disable_animation: false }
  });
  const [showSkipPrompt, setShowSkipPrompt] = useState(false);
  const [skipPass, setSkipPass] = useState("");
  const [skipError, setSkipError] = useState(false);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    {
      title: "Chào mừng đến với Vplay!",
      description: "Cảm ơn bạn đã lựa chọn Vplay - hãy dành một vài phút để thiết lập các cài đặt ban đầu nhé",
      icon: Sparkles,
      color: "text-amber-500"
    },
    {
      title: "Chế độ hiển thị",
      description: "Chọn chế độ hiển thị để phù hợp với cách nhìn của bạn",
      icon: Palette,
      color: "text-indigo-500"
    },
    {
      title: "Giao diện người dùng",
      description: "Bạn đang sử dụng thiết bị nào? Chúng tôi sẽ tối ưu hóa giao diện người dùng cho thiết bị của bạn",
      icon: Layout,
      color: "text-blue-500"
    },
    {
      title: config.useSidebar ? "Cài đặt khác" : "Liquid Glass",
      description: config.useSidebar 
        ? "Tinh chỉnh thêm các cài đặt để phù hợp theo phong cách của bạn."
        : "Tinh chỉnh giao diện kính lỏng theo phong cách của bạn",
      icon: Sliders,
      color: "text-purple-500"
    },
    {
      title: "Cá nhân hóa trải nghiệm",
      description: "Đăng nhập để đồng bộ các kênh yêu thích và các tùy chỉnh của bạn trên mọi thiết bị.",
      icon: User,
      color: "text-purple-500"
    },
    {
      title: "Sẵn sàng trải nghiệm!",
      description: "Mọi thứ đã xong. Cảm ơn bạn đã lựa chọn Vplay!",
      icon: CheckCircle2,
      color: "text-emerald-500"
    }
  ];

  const handleSkip = (e?: FormEvent) => {
    e?.preventDefault();
    if (skipPass === "bypassoobe") {
      onComplete(config);
    } else {
      setSkipError(true);
      setTimeout(() => setSkipError(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[160] flex items-center justify-center p-0 md:p-8"
    >
      {/* Background Image */}
      <img 
        src="https://wallpapercave.com/wp/wp3183649.png" 
        className="absolute inset-0 w-full h-full object-cover"
        alt="background"
      />
      <div className={`absolute inset-0 ${config.isDark ? "bg-slate-950/70" : "bg-white/40"} backdrop-blur-xl`} />

      <div className={`w-full h-full md:h-[600px] md:max-w-5xl rounded-none md:rounded-[40px] shadow-[0_30px_90px_rgba(0,0,0,0.3)] flex flex-col md:flex-row overflow-hidden border relative z-10 ${config.isDark ? "bg-slate-900/60 border-white/10 backdrop-blur-3xl" : "bg-white/90 border-slate-200 backdrop-blur-2xl"}`}>
        
        {/* Left Pane - Identity */}
        <div className={`hidden md:flex flex-[0.7] flex-col items-center justify-center p-12 border-r ${config.isDark ? "bg-white/5 border-white/5" : "bg-blue-50/50 border-slate-100"}`}>
          <div className="relative group flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                key={step}
                className="relative"
              >
              <div className={`absolute inset-0 bg-purple-500/20 blur-[100px] rounded-full scale-[2.5] animate-pulse`} />
              <div className="relative z-10 w-56 h-56 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[64px] flex items-center justify-center shadow-[0_25px_60px_rgba(147,51,234,0.4)]">
                <div className="w-36 h-36 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 shadow-inner">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  >
                    {step === 0 ? (
                      <Send size={100} className="text-white transform -rotate-12 drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" fill="white" />
                    ) : (
                      (() => {
                        const Icon = steps[step].icon;
                        return <Icon size={84} className="text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)]" strokeWidth={1.5} />;
                      })()
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right Pane - Content */}
        <div className="flex-1 flex flex-col p-8 md:p-14 relative overflow-hidden">
          {/* Mobile Header Logo */}
          <div className="md:hidden flex items-center justify-center mb-10">
            <img 
              src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
              className={`h-12 object-contain ${!config.isDark ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]" : ""}`}
              alt="Vplay Mobile Logo"
            />
          </div>

          <div className="flex-1 flex flex-col justify-center overflow-y-auto custom-scrollbar-slim">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ type: "spring", damping: 25, stiffness: 120 }}
                className="space-y-8"
              >
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">
                    {step === 4 ? "Identity Setup" : step === 5 ? "Completion" : "Thiết lập hệ thống"}
                  </p>
                  <h2 className={`text-xl md:text-3xl font-bold tracking-tight leading-tight ${config.isDark ? "text-white" : "text-slate-900"}`}>
                    {steps[step].title}
                  </h2>
                  <p className={`text-base font-medium opacity-50 max-w-md ${config.isDark ? "text-white" : "text-slate-900"}`}>
                    {steps[step].description}
                  </p>
                </div>

                <div className="py-2">
                  {step === 0 && (
                    <div className="space-y-6">
                      <div className={`p-8 rounded-[32px] ${config.isDark ? "bg-white/5" : "bg-slate-50"} border border-transparent`}>
                        <p className={`text-base leading-relaxed font-medium ${config.isDark ? "text-slate-300" : "text-slate-600"}`}>
                          Chào mừng bạn đã đến với thế giới của Vplay. Hãy khám phá kho tàng truyền hình phong phú và chất lượng nhất ngay hôm nay.
                        </p>
                      </div>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: true, label: "Tối (Dark Mode)", icon: Moon, sub: "Tối ưu cho ban đêm và màn hình OLED" },
                        { id: false, label: "Sáng (Light Mode)", icon: Sun, sub: "Rõ nét, tươi mới cho không gian sáng" }
                      ].map(mode => (
                        <button
                          key={mode.id.toString()}
                          onClick={() => setConfig({ ...config, isDark: mode.id })}
                          className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all ${config.isDark === mode.id ? "bg-purple-600 border-purple-600 text-white shadow-[0_10px_25px_rgba(147,51,234,0.3)]" : `${config.isDark ? "bg-white/5 border-transparent hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200 border-transparent text-slate-900"}`}`}
                        >
                          <div className={`p-3.5 rounded-2xl ${config.isDark === mode.id ? "bg-white text-purple-600" : "bg-white/10 text-slate-500"}`}><mode.icon size={24} /></div>
                          <div className="text-left">
                            <h4 className="text-base font-bold">{mode.label}</h4>
                            <p className="text-xs opacity-70">{mode.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: true, label: "Desktop Interface", icon: Monitor, sub: "Tối ưu hóa cho chuột và phím" },
                        { id: false, label: "Touch Interface", icon: MousePointer2, sub: "Các nút lớn, mượt mà cho thiết bị cảm ứng" }
                      ].map(mode => (
                        <button
                          key={mode.id.toString()}
                          onClick={() => setConfig({ ...config, useSidebar: mode.id })}
                          className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all ${config.useSidebar === mode.id ? "bg-purple-600 border-purple-600 text-white shadow-[0_10px_25px_rgba(147,51,234,0.3)]" : `${config.isDark ? "bg-white/5 border-transparent hover:bg-white/10" : "bg-slate-100 hover:bg-slate-200 border-transparent text-slate-900"}`}`}
                        >
                          <div className={`p-3.5 rounded-2xl ${config.useSidebar === mode.id ? "bg-white text-purple-600" : "bg-white/10 text-slate-500"}`}><mode.icon size={24} /></div>
                          <div className="text-left">
                            <h4 className="text-base font-bold">{mode.label}</h4>
                            <p className="text-xs opacity-70">{mode.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      {config.useSidebar ? (
                        <>
                          <div className={`flex items-center justify-between p-6 rounded-3xl ${config.isDark ? "bg-white/5" : "bg-slate-50"}`}>
                            <div className="text-left space-y-1">
                              <h4 className={`text-sm font-bold uppercase tracking-wider ${config.isDark ? "text-white" : "text-slate-900"}`}>Vị trí Sidebar</h4>
                              <p className="text-xs text-slate-500 font-medium">Đặt menu bên trái hoặc phải</p>
                            </div>
                            <div className="flex bg-black/10 p-1.5 rounded-2xl">
                              <button onClick={() => setConfig({...config, isSidebarRight: false})} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${!config.isSidebarRight ? "bg-purple-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}>L</button>
                              <button onClick={() => setConfig({...config, isSidebarRight: true})} className={`px-6 py-2 rounded-xl text-xs font-bold uppercase transition-all ${config.isSidebarRight ? "bg-purple-600 text-white shadow-md" : "text-slate-500 hover:text-slate-300"}`}>R</button>
                            </div>
                          </div>
                          <div className={`flex items-center justify-between p-6 rounded-3xl ${config.isDark ? "bg-white/5" : "bg-slate-50"}`}>
                            <div className="text-left space-y-1">
                              <h4 className={`text-sm font-bold uppercase tracking-wider ${config.isDark ? "text-white" : "text-slate-900"}`}>Ghim kênh</h4>
                              <p className="text-xs text-slate-500 font-medium">Truy cập nhanh kênh yêu thích</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" checked={config.isPinningEnabled} onChange={(e) => setConfig({...config, isPinningEnabled: e.target.checked})} className="sr-only peer" />
                              <div className="w-12 h-6 bg-slate-700 rounded-full peer peer-checked:bg-purple-600 relative after:content-[''] after:absolute after:top-1 after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-6"></div>
                            </label>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <button onClick={() => setConfig({...config, liquidGlass: "glassy"})} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${config.liquidGlass === "glassy" ? "bg-purple-600 border-purple-600 text-white shadow-lg" : "border-slate-200/50 hover:bg-black/5"}`}>
                            <div className={`p-4 rounded-2xl ${config.liquidGlass === "glassy" ? "bg-white text-purple-600" : "bg-purple-500/10 text-purple-600"}`}><Droplet size={32} /></div>
                            <div className="text-center">
                              <span className="text-sm font-bold uppercase tracking-widest block">Glassy</span>
                              <span className="text-[10px] opacity-70 font-medium">Mờ ảo</span>
                            </div>
                          </button>
                          <button onClick={() => setConfig({...config, liquidGlass: "tinted"})} className={`p-8 rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 ${config.liquidGlass === "tinted" ? "bg-purple-600 border-purple-600 text-white shadow-lg" : "border-slate-200/50 hover:bg-black/5"}`}>
                            <div className={`p-4 rounded-2xl ${config.liquidGlass === "tinted" ? "bg-white text-purple-600" : "bg-purple-500/10 text-purple-600"}`}><Palette size={32} /></div>
                            <div className="text-center">
                              <span className="text-sm font-bold uppercase tracking-widest block">Tinted</span>
                              <span className="text-[10px] opacity-70 font-medium">Màu sắc</span>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 4 && (
                    <div className="flex flex-col items-center justify-center py-4 space-y-8">
                      <div className="grid grid-cols-1 gap-4 w-full max-w-sm">
                        <button
                          onClick={onLogin}
                          className="flex items-center gap-5 p-6 rounded-3xl border-2 border-purple-600 bg-purple-600 text-white shadow-lg transition-all active:scale-95"
                        >
                          <div className="p-3.5 rounded-2xl bg-white text-purple-600"><LogIn size={24} /></div>
                          <div className="text-left">
                            <h4 className="text-base font-bold">Đăng nhập tài khoản</h4>
                            <p className="text-xs opacity-70">Sử dụng tài khoản Vplay của bạn</p>
                          </div>
                        </button>
                        <button
                          onClick={nextStep}
                          className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all ${config.isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900"}`}
                        >
                          <div className={`p-3.5 rounded-2xl ${config.isDark ? "bg-white/10" : "bg-white"} text-slate-50`}><User size={24} /></div>
                          <div className="text-left">
                            <h4 className="text-base font-bold">Sử dụng tài khoản đăng xuất</h4>
                            <p className="text-xs opacity-70">Tiếp tục mà không cần đồng bộ</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 5 && (
                    <div className="flex flex-col items-center justify-center py-8 space-y-8">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }} 
                        animate={{ scale: 1, rotate: 0 }} 
                        transition={{ type: "spring", damping: 12, stiffness: 100 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-green-400/30 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-32 h-32 rounded-[40px] bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                          <CheckCircle2 size={64} className="text-white" strokeWidth={2} />
                        </div>
                      </motion.div>
                      <div className="text-center space-y-4 max-w-sm">
                        <motion.h3 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`text-2xl md:text-3xl font-bold tracking-tight ${config.isDark ? "text-white" : "text-slate-900"}`}
                        >
                          Sẵn sàng trải nghiệm!
                        </motion.h3>
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="space-y-4"
                        >
                          <p className={`text-base font-medium opacity-60 leading-relaxed ${config.isDark ? "text-white" : "text-slate-600"}`}>
                            Cài đặt hoàn tất. Cảm ơn bạn đã lựa chọn và tin tưởng sử dụng dịch vụ của <span className="text-purple-500 font-bold">Vplay</span>.
                          </p>
                          <div className={`h-1 w-12 mx-auto rounded-full ${config.isDark ? "bg-white/10" : "bg-slate-200"}`} />
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-500">
                            Enjoy your journey
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Controls */}
          <div className="pt-10 flex items-center justify-between border-t border-black/5 mt-auto">
            <div className="flex items-center gap-6">
              {step === 0 && !showSkipPrompt && (
                <button 
                  onClick={() => setShowSkipPrompt(true)}
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-all ${config.isDark ? "text-white" : "text-slate-900"}`}
                >Skip OOBE</button>
              )}
              {showSkipPrompt && (
                <form onSubmit={handleSkip} className="flex items-center gap-3">
                  <div className={`relative group rounded-2xl overflow-hidden transition-all border-2 ${skipError ? "border-red-500" : config.isDark ? "border-white/10" : "border-slate-200"}`}>
                    <input 
                      autoFocus
                      type="password"
                      placeholder="Passcode..."
                      value={skipPass}
                      onChange={e => setSkipPass(e.target.value)}
                      className="px-4 py-2 text-xs font-bold bg-transparent outline-none w-36"
                    />
                  </div>
                  <button type="button" onClick={() => setShowSkipPrompt(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={18}/></button>
                </form>
              )}
            </div>

            <div className="flex items-center gap-4">
              {step > 0 && (
                <button onClick={prevStep} className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${config.isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}>
                  <ChevronLeft size={24} />
                </button>
              )}
              <button 
                onClick={step === 5 ? () => onComplete(config) : nextStep}
                className="btn-purple-3d px-12 h-16 flex items-center gap-3"
              >
                <span className="capitalize">{step === 0 ? "Bắt đầu thiết lập" : step === 5 ? "Khám phá ngay" : "Tiếp theo"}</span>
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        </div>
      </div>

       {/* Accessibility Icons */}
       <div className="fixed bottom-10 right-10 flex items-center gap-6 opacity-30">
         <div className={`p-1.5 rounded-lg ${config.isDark ? "text-white" : "text-slate-900"}`}><Accessibility size={24} /></div>
         <div className={`p-1.5 rounded-lg ${config.isDark ? "text-white" : "text-slate-900"}`}><Volume2 size={24} /></div>
       </div>
    </motion.div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(false);
  const [splashDuration, setSplashDuration] = useState(5000);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("vplay_onboarding_completed") !== "true";
  });
  const [activeTab, setActiveTab] = useState("Trang chủ");

  useEffect(() => {
    // If no onboarding, show splash normally (wait for click)
    if (!showOnboarding && localStorage.getItem("vplay_onboarding_completed") === "true") {
      setShowSplash(true);
    } else if (!showOnboarding && !localStorage.getItem("vplay_onboarding_completed")) {
       // First time but maybe some error or user reset, show OOBE
       setShowOnboarding(true);
    }
  }, [showOnboarding]);

  const handleOnboardingComplete = (config: any) => {
    setIsDark(config.isDark);
    setUseSidebar(config.useSidebar);
    setLiquidGlass(config.liquidGlass);
    setIsSidebarRight(config.isSidebarRight);
    setIsPinningEnabled(config.isPinningEnabled);
    setFeatureFlags(config.featureFlags);
    
    localStorage.setItem("vplay_sidebar", config.useSidebar.toString());
    localStorage.setItem("vplay_sidebar_right", config.isSidebarRight.toString());
    localStorage.setItem("vplay_pinning", config.isPinningEnabled.toString());
    localStorage.setItem("vplay_feature_flags", JSON.stringify(config.featureFlags));
    localStorage.setItem("vplay_onboarding_completed", "true");
    
    setShowOnboarding(false);
    
    // Start 10s automatic splash
    setSplashDuration(10000);
    setShowSplash(true);
  };
  const [lastTab, setLastTab] = useState("Trang chủ");
  const [prevTab, setPrevTab] = useState("Trang chủ");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [hoveredTabRect, setHoveredTabRect] = useState<DOMRect | null>(null);
  const [liquidGlass, setLiquidGlass] = useState<"glassy" | "tinted">("glassy");
  const [useSidebar, setUseSidebar] = useState(() => {
    return localStorage.getItem("vplay_sidebar") === "true";
  });
  const [isSidebarRight, setIsSidebarRight] = useState(() => {
    return localStorage.getItem("vplay_sidebar_right") === "true";
  });
  const [isSidebarLocked, setIsSidebarLocked] = useState(() => {
    const saved = localStorage.getItem("vplay_sidebar_locked");
    return saved === null ? true : saved === "true";
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("vplay_sidebar_width");
    return saved ? parseInt(saved, 10) : 280;
  });
  const isResizing = useRef(false);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_locked", isSidebarLocked.toString());
    if (isSidebarLocked) {
      setSidebarWidth(280);
      localStorage.setItem("vplay_sidebar_width", "280");
    }
  }, [isSidebarLocked]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_width", sidebarWidth.toString());
  }, [sidebarWidth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || isSidebarLocked) return;
      
      let newWidth;
      if (isSidebarRight) {
        newWidth = window.innerWidth - e.clientX;
      } else {
        newWidth = e.clientX;
      }
      
      if (newWidth >= 160 && newWidth <= 600) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = "default";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isSidebarLocked, isSidebarRight]);

  const [isPinningEnabled, setIsPinningEnabled] = useState(() => {
    return localStorage.getItem("vplay_pinning") === "true";
  });

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_right", isSidebarRight.toString());
  }, [isSidebarRight]);

  useEffect(() => {
    localStorage.setItem("vplay_pinning", isPinningEnabled.toString());
  }, [isPinningEnabled]);
  const [activeChannel, setActiveChannel] = useState(channels[0]);
  const [isPlayerInView, setIsPlayerInView] = useState(true);
  const [pipExplicitlyClosed, setPipExplicitlyClosed] = useState(false);
  const [sortOrder, setSortOrder] = useState<"default" | "az" | "za">("default");
  const [slideIndex, setSlideIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loadingTreatment, setLoadingTreatment] = useState<string>(() => {
    return localStorage.getItem("vplay_loading_treatment") || "treatment1";
  });

  useEffect(() => {
    localStorage.setItem("vplay_loading_treatment", loadingTreatment);
  }, [loadingTreatment]);

  const [featureFlags, setFeatureFlags] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("vplay_feature_flags");
    return saved ? JSON.parse(saved) : { multiview_experimental: false, disable_animation: false, revamp_processing_loading_circle: false };
  });

  useEffect(() => {
    localStorage.setItem("vplay_feature_flags", JSON.stringify(featureFlags));
  }, [featureFlags]);

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setSlideIndex((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Splash screen now requires manual click to unblock audio
  }, []);

  useEffect(() => {
    if (activeTab !== "Cài đặt") {
      setLastTab(activeTab);
    }
    if (activeTab !== "Cài đặt" && activeTab !== "Tìm kiếm") {
      setPrevTab(activeTab);
    }
  }, [activeTab]);
  const [isDark, setIsDark] = useState(true); // Default to dark for better gradient look
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isSidebarSearchOpen, setIsSidebarSearchOpen] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearchLoading(true);
      const timer = setTimeout(() => {
        const query = searchQuery.toLowerCase().trim();
        const filtered = channels.filter(ch => 
          ch.name.toLowerCase().includes(query) || 
          ch.category?.toLowerCase().includes(query)
        );
        setSearchResults(filtered);
        setIsSearchLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearchLoading(false);
    }
  }, [searchQuery]);

  const [showDevSettings, setShowDevSettings] = useState(false);
  const [showDevPrompt, setShowDevPrompt] = useState(false);
  const [devPass, setDevPass] = useState("");
  const [devError, setDevError] = useState(false);

  useEffect(() => {
    if (searchQuery.toLowerCase() === "devmode") {
      setShowDevSettings(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
    if (searchQuery.toLowerCase() === "/bypass") {
      setBypassed(true);
      setSearchQuery("");
      setIsSearchOpen(false);
      setCustomAlert({ title: "Bypass Active", message: "Bạn đã kích hoạt chế độ Bypass. Truy cập mọi tính năng không cần đăng nhập." });
    }
  }, [searchQuery]);

  const verifyDev = (e: FormEvent) => {
    e.preventDefault();
    if (devPass === "devunlock") {
      setIsDev(true);
      setShowDevPrompt(false);
      setDevPass("");
      setDevError(false);
    } else {
      setDevError(true);
      setDevPass("");
    }
  };

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDev, setIsDev] = useState(() => {
    return localStorage.getItem("vplay_dev_mode") === "true";
  });
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    localStorage.setItem("vplay_dev_mode", isDev.toString());
  }, [isDev]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar", useSidebar.toString());
  }, [useSidebar]);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("vplay_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [customAlert, setCustomAlert] = useState<{ title: string, message: string } | null>(null);

  useEffect(() => {
    localStorage.setItem("vplay_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (ch: typeof channels[0]) => {
    setFavorites(prev => 
      prev.includes(ch.name) 
        ? prev.filter(name => name !== ch.name) 
        : [...prev, ch.name]
    );
  };

  const handleChannelSelect = (ch: typeof channels[0]) => {
    if (!user && !isDev && !bypassed) {
      setShowAuthModal(true);
      return;
    }
    setActiveChannel(ch);
    setPipExplicitlyClosed(false);
    setActiveTab("Phát sóng");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          
          let role = "user";
          if (userSnap.exists()) {
            role = userSnap.data().role;
            setUserData(userSnap.data());
          } else if (currentUser.uid === "special_guest_uid") {
            // Special guest mock data
            role = "user";
            setUserData({
              uid: "special_guest_uid",
              email: "special_guest@vplay.vn",
              displayName: "Tài khoản đặc biệt",
              role: "user"
            });
          } else {
            // Check if it's the default admin
            if (currentUser.email === "nguyentrungthu1610@gmail.com" || 
                currentUser.email === "trungthu1610" || 
                currentUser.displayName === "trungthu1610") {
              role = "admin";
            }
            const newUserData: any = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: role,
              createdAt: serverTimestamp()
            };
            if (currentUser.displayName) newUserData.displayName = currentUser.displayName;
            if (currentUser.photoURL) newUserData.photoURL = currentUser.photoURL;
            
            await setDoc(userRef, newUserData);
            setUserData(newUserData);
          }
          setIsAdmin(role === "admin");
        } catch (error) {
          console.error("Error fetching user data:", error);
          setIsAdmin(false);
          setUserData(null);
        }
      } else {
        setIsAdmin(false);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveTab("Trang chủ");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleResetOnboarding = () => {
    localStorage.removeItem("vplay_onboarding_completed");
    setShowOnboarding(true);
  };

  const tabs = baseTabs.filter(t => {
    if (t.id === "Quản trị" && !isAdmin) return false;
    return true;
  });

  const displayTab = activeTab;

  const handleEnterApp = useCallback(() => {
    setShowSplash(false);
    // This empty play/pause logic unblocks audio globally for the session
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.resume();
  }, []);

  return (
    <MotionConfig 
      transition={featureFlags.disable_animation ? { duration: 0 } : undefined}
      reducedMotion={featureFlags.disable_animation ? "always" : "user"}
    >
      <div className={`${
        isDark 
          ? "bg-slate-900/40 text-white" 
          : "bg-white/40 text-black"
      } min-h-screen flex transition-all duration-500 overflow-x-hidden ${useSidebar ? "flex-row" : "flex-col"} ${featureFlags.disable_animation ? "reduce-animations" : ""}`}
      style={{
        paddingLeft: useSidebar && !isMobile && !isSidebarRight ? (isSidebarExpanded ? sidebarWidth + 24 : 104) : 0,
        paddingRight: useSidebar && !isMobile && isSidebarRight ? (isSidebarExpanded ? sidebarWidth + 24 : 104) : 0,
      }}
      >
      {/* Global Immersive Background Blur */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.25, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img 
              src={slides[slideIndex].url} 
              alt="" 
              className="w-full h-full object-cover blur-[180px] md:blur-[240px] saturate-[250%]"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>
        <div className={`absolute inset-0 transition-colors duration-1000 ${isDark ? "bg-slate-950/60" : "bg-white/60"}`} />
      </div>

      <AnimatePresence>
        {showSplash && (
          <div onClick={handleEnterApp} className="cursor-pointer z-[110]">
            <SplashScreen 
              isDark={isDark} 
              onEnter={handleEnterApp} 
              duration={splashDuration} 
              featureFlags={featureFlags}
              loadingTreatment={loadingTreatment}
            />
          </div>
        )}
        {showOnboarding && (
          <div className="z-[155]">
            <OnboardingWizard isDark={isDark} onComplete={handleOnboardingComplete} onLogin={handleLogin} />
          </div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} isDark={isDark} liquidGlass={liquidGlass} setIsDev={setIsDev} setUserData={setUserData} />
      
      {/* Developer Settings Choice */}
      <LiquidModal
        isOpen={showDevSettings}
        onClose={() => setShowDevSettings(false)}
        isDark={isDark}
        title="Cài đặt nhà phát triển"
        description={isDev ? "Bạn đang ở chế độ nhà phát triển. Bạn có muốn tắt nó không?" : "Bạn muốn kích hoạt chế độ nhà phát triển?"}
        liquidGlass={liquidGlass}
      >
        <div className="flex flex-col gap-3">
          {!isDev ? (
            <button 
              onClick={() => { setShowDevSettings(false); setShowDevPrompt(true); }}
              className="w-full py-4 bg-purple-600/90 hover:bg-purple-500 text-white rounded-[32px] font-bold transition-all shadow-[0_8px_24px_rgba(147,51,234,0.3)] backdrop-blur-md active:scale-95"
            >
              Kích hoạt (Yêu cầu mật khẩu)
            </button>
          ) : (
            <button 
              onClick={() => { setIsDev(false); setShowDevSettings(false); }}
              className="w-full py-4 bg-red-600/90 hover:bg-red-500 text-white rounded-[32px] font-bold transition-all shadow-[0_8px_24px_rgba(239,68,68,0.3)] backdrop-blur-md active:scale-95"
            >
              Hủy kích hoạt
            </button>
          )}
          <button 
            onClick={() => setShowDevSettings(false)}
            className={`w-full py-3 rounded-3xl font-bold transition-all ${
              isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-black/5 text-slate-500 hover:text-slate-900"
            }`}
          >
            Đóng
          </button>
        </div>
      </LiquidModal>

      {/* Developer Mode Prompt */}
      <LiquidModal
        isOpen={showDevPrompt}
        onClose={() => { setShowDevPrompt(false); setDevPass(""); setDevError(false); }}
        isDark={isDark}
        title="Chế độ nhà phát triển"
        description="Kích hoạt tính năng nhà phát triển để truy cập vào các quyền đặc biệt. Bạn cần phải có mật khẩu dành cho nhà phát triển được chia sẻ bởi Chủ Thớt để kích hoạt"
        liquidGlass={liquidGlass}
      >
        <form onSubmit={verifyDev} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase tracking-wider opacity-50 ml-4 ${isDark ? "text-white" : "text-slate-900"}`}>Mật khẩu</label>
            <div className={`relative group rounded-full overflow-hidden transition-all ${
              devError 
                ? "border-red-500 bg-red-500/5" 
                : isDark 
                  ? "bg-white/5" 
                  : "bg-black/5 mx-2"
            }`}>
              <input 
                autoFocus
                type="password" 
                value={devPass} 
                onChange={e => setDevPass(e.target.value)}
                className={`w-full px-6 py-3 bg-transparent outline-none transition-all ${
                  isDark ? "text-white placeholder-white/30" : "text-slate-900 placeholder-slate-400"
                }`}
                placeholder="••••••••"
              />
              {!devError && (
                <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
              )}
            </div>
            {devError && <p className="text-red-500 text-[10px] mt-2 font-bold text-center">Mật khẩu không chính xác!</p>}
          </div>
          
          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-[32px] font-bold transition-all shadow-lg shadow-purple-600/20 active:scale-95"
            >
              Xác nhận
            </button>
            <button 
              type="button"
              onClick={() => { setShowDevPrompt(false); setDevPass(""); setDevError(false); }}
              className={`w-full py-3 rounded-3xl font-bold transition-all ${
                isDark ? "bg-white/5 text-slate-400 hover:text-white" : "bg-black/5 text-slate-500 hover:text-slate-900"
              }`}
            >
              Hủy
            </button>
          </div>
        </form>
      </LiquidModal>

      <div className="flex-1 flex flex-col min-h-screen px-0 md:px-8">
        <AnimatePresence>
          {useSidebar && !isMobile && (
            <div className="fixed inset-0 pointer-events-none z-[40]">
               {/* This space is reserved for the floating sidebar shadows/click-through */}
            </div>
          )}
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className={`fixed inset-0 z-[45] bg-black/20 ${liquidGlass ? "backdrop-blur-[2px]" : ""}`}
            />
          )}
        </AnimatePresence>

        <LiquidModal 
          isOpen={!!customAlert} 
          onClose={() => setCustomAlert(null)} 
          isDark={isDark}
          title={customAlert?.title}
          description={customAlert?.message}
          liquidGlass={liquidGlass}
        >
          <button 
            onClick={() => setCustomAlert(null)}
            className="w-full py-4 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-3xl font-bold transition-all active:scale-95"
          >
            Xác nhận
          </button>
        </LiquidModal>

        <div className="flex-1 overflow-y-auto pb-32 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {displayTab === "Trang chủ" && (
                <HomeContent 
                  setActiveTab={setActiveTab} 
                  setActiveChannel={handleChannelSelect} 
                  isDark={isDark} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  liquidGlass={liquidGlass}
                  user={user}
                  onLogin={handleLogin}
                  slideIndex={slideIndex}
                  direction={direction}
                  paginate={paginate}
                  bypassed={bypassed}
                />
              )}
              {displayTab === "Phát sóng" && (
                <TVContent 
                  active={activeChannel} 
                  setActive={handleChannelSelect} 
                  isDark={isDark} 
                  favorites={favorites} 
                  toggleFavorite={toggleFavorite} 
                  user={user}
                  onLogin={handleLogin}
                  isDev={isDev}
                  liquidGlass={liquidGlass}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  showSplash={showSplash}
                  featureFlags={featureFlags}
                  searchQuery={searchQuery}
                  bypassed={bypassed}
                  setIsPlayerInView={setIsPlayerInView}
                />
              )}
              {displayTab === "Lưu trữ" && (
                <EventsContent isDark={isDark} liquidGlass={liquidGlass} />
              )}
              {displayTab === "Experimental" && (
                <ExperimentalContent 
                  isDark={isDark} 
                  featureFlags={featureFlags} 
                  setFeatureFlags={setFeatureFlags} 
                  liquidGlass={liquidGlass} 
                  loadingTreatment={loadingTreatment}
                  setLoadingTreatment={setLoadingTreatment}
                />
              )}
              {displayTab === "Cài đặt" && (
                <div className="flex-1 overflow-x-hidden md:overflow-y-auto">
                  <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-4 mb-10">
                      <Settings className={`w-10 h-10 ${isDark ? "text-white" : "text-slate-900"}`} />
                      <h2 className={`text-3xl font-semibold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Cài đặt</h2>
                    </div>
                    <SettingsContent 
                      isDark={isDark} 
                      setIsDark={setIsDark} 
                      isDev={isDev} 
                      setIsDev={setIsDev} 
                      featureFlags={featureFlags}
                      setFeatureFlags={setFeatureFlags}
                      liquidGlass={liquidGlass} 
                      setLiquidGlass={setLiquidGlass}
                      useSidebar={useSidebar}
                      setUseSidebar={setUseSidebar}
                      isSidebarRight={isSidebarRight}
                      setIsSidebarRight={setIsSidebarRight}
                      isSidebarLocked={isSidebarLocked}
                      setIsSidebarLocked={setIsSidebarLocked}
                      isPinningEnabled={isPinningEnabled}
                      setIsPinningEnabled={setIsPinningEnabled}
                      user={user}
                      userData={userData}
                      setUserData={setUserData}
                      onAlert={(title, msg) => setCustomAlert({ title, message: msg })}
                      onLogin={handleLogin}
                      onUpdateLogsClick={() => setActiveTab("Update Logs")}
                      favorites={favorites}
                      onResetOnboarding={handleResetOnboarding}
                      bypassed={bypassed}
                    />
                  </div>
                </div>
              )}
              {displayTab === "Update Logs" && (
                <UpdateLogsContent isDark={isDark} onBack={() => setActiveTab("Cài đặt")} featureFlags={featureFlags} loadingTreatment={loadingTreatment} />
              )}
              {displayTab === "Quản trị" && isAdmin && <AdminContent isDark={isDark} liquidGlass={liquidGlass} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Sidebar Redesign */}
      <AnimatePresence>
        {useSidebar && (
          <>
            {/* Mobile Hamburger Toggle */}
            {isMobile && !isSidebarExpanded && (
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => setIsSidebarExpanded(true)}
                className={`fixed top-6 z-[51] p-3.5 rounded-2xl shadow-2xl transition-all active:scale-95 ${
                  isSidebarRight ? "right-6" : "left-6"
                } ${
                  isDark ? "bg-[#11141d] text-white border border-white/10" : "bg-white text-slate-800 border border-slate-200"
                } backdrop-blur-xl`}
              >
                <Menu size={24} />
              </motion.button>
            )}

            {/* Mobile Backdrop Overlay */}
            {isMobile && isSidebarExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarExpanded(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[48]"
              />
            )}
            
            <motion.div
              initial={{ x: isSidebarRight ? sidebarWidth : -sidebarWidth }}
              animate={{ 
                x: 0, 
                width: isSidebarExpanded ? sidebarWidth : (isMobile ? "100%" : 80),
                opacity: (isMobile && !isSidebarExpanded) ? 0 : 1,
                visibility: (isMobile && !isSidebarExpanded) ? "hidden" : "visible" as any
              }}
              exit={{ x: isSidebarRight ? sidebarWidth : -sidebarWidth }}
              transition={{ type: "spring", damping: 30, stiffness: 300, width: { duration: 0 } }}
              className={`fixed z-50 h-[calc(100%-48px)] flex flex-col transition-all duration-0 overflow-visible ${
                isSidebarRight ? "right-6" : "left-6"
              } ${
                isMobile 
                  ? "top-0 h-full !rounded-none !m-0 !left-0 !right-0 transition-none" 
                  : "top-6 !rounded-[32px] border shadow-2xl backdrop-blur-md"
              } ${
                isDark ? "bg-[#11141d]/85 border-white/5 shadow-black/50" : "bg-white/85 border-slate-200 shadow-slate-200"
              }`}
            >
              {/* Resize Handle */}
              {!isSidebarLocked && !isMobile && isSidebarExpanded && (
                <div
                  onMouseDown={() => {
                    isResizing.current = true;
                    document.body.style.cursor = 'col-resize';
                  }}
                  className={`absolute top-0 bottom-0 w-1.5 cursor-col-resize z-[60] transition-colors hover:bg-purple-500/30 ${
                    isSidebarRight ? "-left-0.5" : "-right-0.5"
                  }`}
                />
              )}

              {/* Logo & Hamburger Section */}
              <div className="p-6">
                <div className={`flex items-center gap-4 h-12 ${!isSidebarExpanded ? "justify-center" : ""}`}>
                  <AnimatePresence mode="wait">
                    {!isSidebarExpanded ? (
                      <motion.button 
                        key="collapsed-logo"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsSidebarExpanded(true)}
                        className="w-12 h-12 flex items-center justify-center transition-all group overflow-hidden relative"
                      >
                        <img 
                          src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
                          alt="Vplay" 
                          className="w-10 h-10 object-contain drop-shadow-lg group-hover:scale-110 transition-transform" 
                          referrerPolicy="no-referrer"
                        />
                      </motion.button>
                    ) : (
                      <motion.div 
                        key="expanded-logo"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-4 w-full"
                      >
                        <button 
                          onClick={() => setIsSidebarExpanded(false)}
                          className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/5 text-white" : "hover:bg-slate-100 text-slate-800"}`}
                        >
                          <Menu size={28} />
                        </button>
                        <div className="flex items-center">
                          <img 
                            src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
                            alt="Vplay" 
                            className="h-10 w-10 object-contain drop-shadow-md"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Integrated Search Bar */}
              <div className="px-6 py-2 mb-4 relative">
                <motion.div 
                  initial={false}
                  animate={{ 
                    width: isSidebarExpanded || isSidebarSearchOpen ? "100%" : "50px",
                    x: isSidebarExpanded || isSidebarSearchOpen ? 0 : (isSidebarRight ? "auto" : 0)
                  }}
                  className={`relative group flex items-center gap-3 h-[50px] rounded-full overflow-hidden transition-all ${
                    isDark ? "bg-white/5 hover:bg-white/10" : "bg-slate-50 hover:bg-slate-100"
                  } ${!isSidebarExpanded && !isSidebarSearchOpen ? "cursor-pointer justify-center px-0" : "px-4"}`}
                  onClick={() => {
                    if (!isSidebarExpanded && !isSidebarSearchOpen) {
                      setIsSidebarSearchOpen(true);
                    }
                  }}
                >
                  <Search 
                    size={20} 
                    className={`${isDark ? "text-slate-500" : "text-slate-400"} group-focus-within:text-purple-400 transition-colors flex-shrink-0`} 
                  />
                  {(isSidebarExpanded || isSidebarSearchOpen) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex-1 flex items-center"
                    >
                      <input 
                        type="text" 
                        placeholder="Search or use commands"
                        autoFocus={isSidebarSearchOpen && !isSidebarExpanded}
                        value={searchQuery}
                        onBlur={() => {
                          if (!isSidebarExpanded) setIsSidebarSearchOpen(false);
                        }}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "/bypass") {
                            setBypassed(true);
                            setSearchQuery("");
                            setCustomAlert({ title: "Bypass Activated", message: "Bạn đã kích hoạt chế độ bypass đăng nhập. Bạn có quyền truy cập vào mọi tính năng yêu cầu đăng nhập." });
                          } else {
                            setSearchQuery(val);
                          }
                        }}
                        className={`bg-transparent border-none outline-none text-sm font-semibold w-full ${isDark ? "text-white placeholder-slate-600" : "text-slate-900 placeholder-slate-400"}`}
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white p-1">
                          <X size={14} />
                        </button>
                      )}
                    </motion.div>
                  )}
                  <div className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-300 ${isDark ? "bg-white/10" : "bg-slate-200"} group-focus-within:bg-purple-500 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.5)]`} />
                </motion.div>

                {/* Search Results Dropdown */}
                    <AnimatePresence>
                      {searchQuery.trim().length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className={`absolute top-full left-6 right-6 mt-4 z-[60] overflow-hidden ${
                            isDark ? "popup-3d-dark" : "popup-3d-light"
                          } backdrop-blur-3xl`}
                        >
                          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                            {isSearchLoading ? (
                              <div className="p-8 flex flex-col items-center justify-center space-y-4">
                                <img 
                                  src={
                                    !featureFlags?.revamp_processing_loading_circle 
                                      ? "https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif"
                                      : loadingTreatment === "treatment1"
                                        ? "https://upload.wikimedia.org/wikipedia/commons/3/3f/Windows-loading-cargando.gif?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                                        : loadingTreatment === "treatment2"
                                          ? "https://cdn.pixabay.com/animation/2025/10/01/12/56/12-56-37-235_512.gif"
                                          : loadingTreatment === "treatment3"
                                            ? "https://cdn.pixabay.com/animation/2025/09/06/21/34/21-34-46-885_512.gif"
                                            : "https://cdn.pixabay.com/animation/2023/10/08/03/19/03-19-26-213_512.gif"
                                  } 
                                  alt="Loading" 
                                  className={`w-10 h-10 ${
                                    (!featureFlags?.revamp_processing_loading_circle && isDark) ? "filter brightness-0 invert" : ""
                                  } ${
                                    ((loadingTreatment === "treatment1" || loadingTreatment === "treatment3") && !isDark && featureFlags?.revamp_processing_loading_circle) ? "filter grayscale brightness-0" : ""
                                  }`}
                                />
                                <span className={`text-[10px] font-semibold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-400"}`}>Đang tìm kiếm...</span>
                              </div>
                            ) : searchResults.length > 0 ? (
                              <div className="p-2 space-y-1">
                                {searchResults.map(ch => (
                                  <button
                                    key={ch.name}
                                    onClick={() => {
                                      handleChannelSelect(ch);
                                      setSearchQuery("");
                                    }}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                                      isDark ? "hover:bg-white/5" : "hover:bg-slate-50"
                                    }`}
                                  >
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${isDark ? "bg-white/5" : "bg-white shadow-sm"}`}>
                                      <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                                    </div>
                                    <div className="flex flex-col items-start min-w-0">
                                      <span className={`text-sm font-semibold truncate w-full ${isDark ? "text-white" : "text-slate-900"}`}>{ch.name}</span>
                                      <span className="text-[10px] font-semibold text-slate-500 uppercase">{ch.category}</span>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <div className="p-8 text-center text-slate-500 text-[10px] font-semibold uppercase tracking-widest">
                                Không tìm thấy kết quả
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {tabs.filter(t => t.id !== "Cài đặt").map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === (tab.id || tab.name);
                  return (
                    <button
                      key={tab.name}
                      onClick={() => {
                        setActiveTab(tab.id || tab.name);
                        if (isMobile) setIsSidebarExpanded(false);
                      }}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all relative group h-[50px] overflow-hidden ${
                        isActive 
                          ? (isDark ? "bg-[#1d2230] text-white" : "bg-slate-100 text-slate-900") 
                          : (isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-slate-50")
                      } ${!isSidebarExpanded ? "justify-center" : ""}`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="sidebarActivePill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-500 rounded-r-full" 
                        />
                      )}
                      <Icon size={24} className={`flex-shrink-0 transition-all ${isActive ? "text-purple-500" : "group-hover:scale-110"}`} />
                      {isSidebarExpanded && (
                        <span className="font-bold text-base whitespace-nowrap">{tab.name}</span>
                      )}
                    </button>
                  );
                })}

                {/* Channel Pinning Section */}
                {isPinningEnabled && favorites.length > 0 && (
                  <div className="pt-4 pb-2">
                    <div className={`h-px mx-3 mb-4 ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                    {isSidebarExpanded && (
                      <span className="px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Ghim Kênh</span>
                    )}
                    <div className="space-y-1">
                      {favorites.map(favId => {
                        const channel = channels.find(c => c.name === favId);
                        if (!channel) return null;
                        return (
                          <button
                            key={favId}
                            onClick={() => {
                              setActiveTab("Phát sóng");
                              setActiveChannel(channel);
                              if (isMobile) setIsSidebarExpanded(false);
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-2 rounded-xl transition-all group h-[48px] ${
                              isDark ? "text-slate-400 hover:text-white hover:bg-white/5" : "text-slate-600 hover:bg-slate-50"
                            } ${!isSidebarExpanded ? "justify-center" : ""}`}
                          >
                            <img 
                              src={channel.logo} 
                              alt={channel.name}
                              className={`w-8 h-8 object-contain transition-transform group-hover:scale-110 ${!isDark ? "bg-white rounded-md shadow-sm border border-slate-100 p-0.5" : ""}`}
                              referrerPolicy="no-referrer"
                            />
                            {isSidebarExpanded && (
                              <span className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">{channel.name}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className={`p-6 mt-auto space-y-6 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}>
                {isSidebarExpanded && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                         SMR26 - Build 26504
                       </span>
                       <div className="px-1.5 py-0.5 rounded bg-cyan-400 text-[9px] font-bold text-slate-900 uppercase flex items-center gap-1 shadow-sm">
                         <Zap size={8} fill="currentColor" /> DEV
                       </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => {
                    setActiveTab("Cài đặt");
                    if (isMobile) setIsSidebarExpanded(false);
                  }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all w-full h-[50px] relative overflow-hidden ${
                    activeTab === "Cài đặt"
                      ? (isDark ? "bg-[#1d2230] text-white" : "bg-slate-100 text-slate-900")
                      : (isDark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:bg-slate-50")
                  } ${!isSidebarExpanded ? "justify-center" : ""}`}
                >
                  {activeTab === "Cài đặt" && (
                    <motion.div 
                      layoutId="sidebarActivePill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-purple-500 rounded-r-full" 
                    />
                  )}
                  <SettingsIcon className={`w-6 h-6 ${activeTab === "Cài đặt" ? "text-purple-500" : ""}`} />
                  {isSidebarExpanded && <span className="font-bold text-base">Cài đặt</span>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className={`fixed z-50 transition-all duration-500 ${
        useSidebar 
          ? "bottom-[-100%] opacity-0 pointer-events-none" 
          : "bottom-0 left-0 w-full flex justify-center pb-4 md:pb-8"
      }`}>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 150,
            delay: 0.5
          }}
          className="flex items-center gap-1 md:gap-3 pointer-events-auto"
        >
          <AnimatePresence mode="popLayout">
            {!isSearchOpen && (
              <motion.nav 
                key="nav-bar"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                className={`flex items-center gap-2 p-2 transition-all duration-500 overflow-hidden ${
                  liquidGlass === "tinted"
                    ? `rounded-full border shadow-[0_20px_40px_rgba(0,0,0,0.15)] backdrop-blur-[100px] max-w-full bg-white/80 border-white/80`
                    : liquidGlass === "glassy"
                      ? "rounded-full border shadow-[0_30px_60px_rgba(0,0,0,0.2)] backdrop-blur-[120px] max-w-full bg-white/10 border-white/20"
                      : `rounded-none border-t w-full justify-around backdrop-blur-none shadow-2xl ${isDark ? "bg-slate-900/95 border-white/5" : "bg-white/60 border-white/40"}`
                } flex-row`}>
                <div className={`flex items-center ${liquidGlass ? "gap-4 md:gap-6" : "gap-0 w-full justify-around"}`}>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === (tab.id || tab.name);
                    const userAvatar = ((tab.id === "Cài đặt" || tab.name === "Cài đặt") && user) ? (userData?.photoURL || user.photoURL) : null;
                    
                    const isGlassy = liquidGlass === "glassy";

                    return (
                      <div key={tab.name} className="relative">
                        <button
                          onMouseEnter={(e) => {
                            setHoveredTab(tab.name);
                            setHoveredTabRect(e.currentTarget.getBoundingClientRect());
                          }}
                          onMouseLeave={() => {
                            setHoveredTab(null);
                            setHoveredTabRect(null);
                          }}
                          onClick={() => setActiveTab(tab.name)}
                          className={`relative flex flex-col items-center justify-center px-2 md:px-4 py-2 transition-all duration-300 group z-10 ${
                            liquidGlass ? "rounded-2xl" : "rounded-none flex-1"
                          } ${
                            isActive 
                              ? (isGlassy ? "text-white" : "text-black") 
                              : isGlassy ? "text-white/70 hover:text-white" : liquidGlass === "tinted" ? "text-black hover:opacity-100 opacity-100" : isDark ? "text-slate-400 hover:text-white" : "text-black hover:opacity-100"
                          }`}
                        >
                          {isActive && liquidGlass && (
                            <motion.div
                              layoutId="activeTabPill"
                              className={`absolute inset-0 rounded-full z-[-1] shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
                                isGlassy ? "bg-white/20" : "bg-white"
                              }`}
                              transition={{ type: "spring", bounce: 0.5, duration: 0.6 }}
                            />
                          )}
                          <motion.div
                            initial={{ scale: 1 }}
                            animate={{ scale: isActive ? 1.1 : 1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`z-10 ${tab.name === "Trang chủ" ? "translate-y-[1.5px]" : ""}`}
                          >
                            {userAvatar ? (
                              <img 
                                src={userAvatar} 
                                alt="Avatar" 
                                className={`h-7 w-7 flex-shrink-0 rounded-full object-cover transition-transform duration-300 border ${isActive ? "scale-110 border-purple-500" : "group-hover:scale-110 border-transparent"}`} 
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <Icon className={`h-7 w-7 flex-shrink-0 transition-transform duration-300 ${
                                isActive ? "scale-110" : "group-hover:scale-110"
                              } ${!isDark ? "text-black" : ""}`} />
                            )}
                          </motion.div>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* AUTH / LOGOUT */}
                {liquidGlass && user && (
                  <div className="px-3 border-l border-slate-500/20 ml-1 flex items-center">
                    <button onClick={handleLogout} className={`p-2 rounded-xl transition-colors ${isDark ? "bg-slate-800 text-red-400 hover:bg-red-500/20" : "bg-slate-100 text-red-500 hover:bg-red-500/10"}`} title="Đăng xuất">
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </motion.nav>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {isSearchOpen ? (
              <div className="relative flex flex-col items-center">
                <SearchPopup 
                  isDark={isDark} 
                  searchQuery={searchQuery} 
                  setActiveChannel={handleChannelSelect} 
                  onClose={() => setIsSearchOpen(false)} 
                  favorites={favorites}
                  liquidGlass={liquidGlass}
                  setActiveTab={setActiveTab}
                  setIsDark={setIsDark}
                  setLiquidGlass={setLiquidGlass}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  setSortOrder={setSortOrder}
                />
                <motion.div 
                  key="search-expanded"
                  initial={{ y: 200, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 200, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`p-1.5 flex items-center border shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden ${
                    liquidGlass === "glassy" ? "rounded-[30px] backdrop-blur-[100px] bg-white/10 border-white/20" : liquidGlass === "tinted" ? "rounded-[30px] backdrop-blur-[100px] bg-white/90 border-white/80" : "rounded-xl backdrop-blur-none bg-white/60 border-white/40"
                  }`}
                >
                  <SearchBar 
                    isDark={isDark} 
                    query={searchQuery} 
                    setQuery={setSearchQuery} 
                    onClose={() => setIsSearchOpen(false)} 
                    liquidGlass={liquidGlass}
                  />
                </motion.div>
              </div>
            ) : (
              (liquidGlass === "glassy" || liquidGlass === "tinted") && (
                <motion.button
                  key="search-circle"
                  layoutId="search-button"
                  onClick={() => setIsSearchOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ borderRadius: "50%" }}
                  animate={{ borderRadius: "50%" }}
                  className={`w-[60px] h-[60px] md:w-[72px] md:h-[72px] flex items-center justify-center rounded-full border shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 shadow-2xl ${
                    liquidGlass === "tinted" 
                      ? "bg-white/80 border-white/80 text-black backdrop-blur-[100px]" 
                      : "bg-white/10 border-white/10 text-white backdrop-blur-[120px]"
                  } hover:opacity-70`}
                >
                  <img 
                    src="https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi" 
                    alt="Search" 
                    className={`h-7 w-7 md:h-8 md:w-8 object-contain ${
                      liquidGlass === "glassy" ? "invert brightness-200" : "grayscale brightness-0 contrast-200"
                    }`} 
                    referrerPolicy="no-referrer" 
                  />
                </motion.button>
              )
            )}
          </AnimatePresence>
          <Tooltip text={hoveredTab || ""} show={!!hoveredTab} targetRect={hoveredTabRect} />
        </motion.div>
      </div>
      {activeChannel && featureFlags.PiP_experimental && !pipExplicitlyClosed && (activeTab !== "Phát sóng" || !isPlayerInView) && (
        <MiniPlayer 
          channel={activeChannel} 
          isDark={isDark} 
          onClose={() => setPipExplicitlyClosed(true)} 
          liquidGlass={liquidGlass}
        />
      )}
    </div>
  </MotionConfig>
);
}

export default App;