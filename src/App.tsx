/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, ChangeEvent, FormEvent, ReactNode } from "react";
import { 
  Calendar, Play, Pause, Radio, Info, Sun, Moon, Maximize, Volume2, VolumeX, CheckCircle2, Shield, X, Lock, Terminal, Zap, Clock, History, MousePointer2, Sliders, ChevronLeft, ChevronRight, Layers, Filter, Sparkles, Camera, Palette, Layout, MessageSquare, Eye, EyeOff, ExternalLink, Monitor, Columns, Maximize2, Circle, AlertCircle, RotateCcw, Droplet, Trophy, Film, Music, Globe, Activity, ShieldCheck, LayoutGrid, ArrowRight, ArrowLeft, TrendingUp, Star, Crown, Menu, Pin, Send, Accessibility, Navigation, LayoutTemplate, LayoutPanelLeft, Square, Smartphone, Unlock, Thermometer,
  Home, Tv, Settings, LogIn, LogOut, Heart, Users, User, Mic, Search, Folder, FolderOpen, Pizza, Cloud, CreditCard, Gift, HelpCircle, FlaskConical as Flask
} from "lucide-react";
import Hls from "hls.js";
import { motion, AnimatePresence, MotionConfig } from "motion/react";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail, User as FirebaseUser, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, updateDoc, arrayUnion, getDocFromServer } from "firebase/firestore";

import { channels, Channel } from "./channels";

const HomeIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Home className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const TvIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Tv className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const SettingsIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Settings className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const SignInIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <LogIn className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const SignOutIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <LogOut className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const ExperimentalIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Pizza className={className} size={size || 22} strokeWidth={strokeWidth || 1} />;
const LikeIcon = ({ className, size, filled, strokeWidth }: { className?: string, size?: number | string, filled?: boolean, strokeWidth?: number }) => <Heart className={className} size={size || 20} fill={filled ? "currentColor" : "none"} strokeWidth={strokeWidth || 1.5} />;
const CommunityIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Users className={className} size={size || 20} strokeWidth={strokeWidth || 1.5} />;
const AccountIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <User className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const MicIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Mic className={className} size={size || 20} strokeWidth={strokeWidth || 1.5} />;
const SearchIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <Search className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;
const FolderIcon = ({ className, size, strokeWidth }: { className?: string, size?: number | string, strokeWidth?: number }) => <FolderOpen className={className} size={size || 22} strokeWidth={strokeWidth || 1.5} />;


// Test connection as per critical directive
// Test connection removed

const EXPERIMENTS = [
  {
    id: "rejunvenated_settings",
    name: "Settings Rejuventation",
    desc: "Thử nghiệm hành vi và hiển thị cài đặt mới"
  },
  {
    id: "multiview_channels",
    name: "Multi-view",
    desc: "Lựa chọn xem nhiều kênh truyền hình cùng một thời điểm"
  },
  {
    id: "screen_recording",
    name: "Ghi màn hình",
    desc: "Cho phép ghi lại màn hình kênh truyền hình đang phát và lưu về thiết bị của bạn"
  },
  {
    id: "PiP_experimental",
    name: "Picture in Picture",
    desc: "Hiển thị hình phát thu nhỏ của kênh đang xem khi chuyển sang trang khác hoặc cuộn xuống."
  }
];

const TREATMENTS = [
  { id: "treatment1", name: "Rotating Balls", desc: "Animation with rotating elements." },
  { id: "treatment3", name: "Chasing Snake", desc: "Clean and simple loading chasing effect." }
];

const LoadingSpinner = ({ isDark, className = "w-6 h-6" }: { isDark: boolean, className?: string }) => (
  <div className={`relative ${className}`}>
    <svg 
      className="animate-spin w-full h-full" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ animationDuration: '1.2s' }}
    >
      <path 
        className="opacity-100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
        d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4527"
        style={{ color: isDark ? '#d946ef' : '#9333ea' }}
      />
    </svg>
  </div>
);

const SplashScreen = ({ isDark, onEnter, duration = 5000 }: { isDark: boolean, onEnter: () => void, duration?: number }) => {
  useEffect(() => {
    const timer = setTimeout(onEnter, duration);
    return () => clearTimeout(timer);
  }, [onEnter, duration]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[110] flex flex-col items-center justify-center overflow-hidden bg-[#1a1a1a]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <LoadingSpinner isDark={true} className="w-16 h-16" />
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
  { name: "Trang chủ", icon: HomeIcon, id: "Trang chủ" },
  { name: "Khám phá", icon: SearchIcon, id: "Khám phá" },
  { name: "Phát sóng", icon: TvIcon, id: "Phát sóng" },
  { name: "Lưu trữ", icon: FolderIcon, id: "Lưu trữ" },
  { name: "Cài đặt", icon: SettingsIcon, id: "Cài đặt" },
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`absolute inset-0 bg-black/40 ${liquidGlass ? "backdrop-blur-sm" : ""}`}
          />
          <motion.div
            initial={{ scale: 1.2, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0, y: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative w-full max-w-md overflow-hidden ${
              isDark 
                ? "popup-3d-dark" 
                : "popup-3d-light"
            } ${
              liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"
            }`}
          >
            <div className="p-10 text-center">
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

function ChannelLogo({ src, alt, className, isDark, liquidGlass, status }: { src: string, alt: string, className?: string, isDark: boolean, liquidGlass?: "glassy" | "tinted", status?: string }) {
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-slate-800/50 rounded-[23px] border border-slate-700/50 p-1 text-center`}>
        <TvIcon size={24} className={liquidGlass === "tinted" ? "text-black" : "text-slate-500 mb-1"} />
        <span className={`text-[10px] font-bold leading-tight line-clamp-2 uppercase ${liquidGlass === "tinted" ? "text-black/60" : "opacity-60"}`}>{alt}</span>
      </div>
    );
  }

  const scaleMap: { [key: string]: string } = {
    "Lâm Đồng 1 (LTV1)": "scale-[1.6]",
    "Đà Nẵng 1 (DNRT1)": "scale-[1.8]",
    "Đà Nẵng 2 (DNRT2)": "scale-[1.8]",
    "Thái Nguyên (TN)": "scale-[1.6]",
    "Điện Biên (ĐTV)": "scale-[0.9]",
    "Hưng Yên (HYTV)": "scale-[1.8]",
    "Đồng Tháp 1 (THĐT1)": "scale-[1.8]",
    "Huế (HueTV)": "scale-[1.6]",
    "Tây Ninh (TN)": "scale-[1.6]",
    "H1": "scale-[2.0]",
    "H2": "scale-[2.0]",
    "Đắk Lắk (DRT)": "scale-[1.5]",
    "ĐNNRTV1": "scale-[1.2]",
    "ĐNNRTV2": "scale-[1.2]",
    "Nghệ An (NTV)": "scale-[1.5]",
    "Quảng Ngãi 1 (QNgTV1)": "scale-[1.6]",
    "Quảng Ngãi 2 (QNgTV2)": "scale-[1.6]",
    "HTV Thể Thao": "scale-[1.7]",
    "VTV1": "scale-[1.1]",
    "VTV7": "scale-[1.2]",
    "VTV10": "scale-[1.2]"
  };

  const scaleClass = scaleMap[alt] || (alt.startsWith("VTV") ? "scale-[1.3]" : "scale-[1.1]");

  return (
    <img 
      src={src} 
      alt={alt} 
      referrerPolicy="no-referrer"
      onError={() => setError(true)}
      className={`${className} object-contain p-0 transition-all duration-300 ${
        liquidGlass === "tinted" 
          ? "opacity-100" 
          : !isDark ? "drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]" : ""
      } ${scaleClass} ${status === "maintenance" ? "grayscale opacity-20" : status === "coming-soon" ? "" : ""}`} 
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
  const isComingSoon = ch.status === "coming-soon";
  const isVTV6 = ch.name.includes("VTV6");

  const getVTV6Days = () => {
    const target = new Date('2026-06-08T00:00:00').getTime();
    const now = new Date().getTime();
    const diff = target - now;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`relative group ${className || ""}`}>
      {/* Background blur/glow effect */}
      <div className={`absolute -inset-1 rounded-[23px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0 ${isActive ? "bg-purple-500/20 opacity-100" : isDark ? "bg-white/5" : "bg-slate-500/10"}`} />
      
      <motion.button
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onClick}
        className={`w-full aspect-video p-1.5 flex items-center justify-center relative overflow-hidden transition-all duration-300 z-10 ${
          isActive
            ? `btn-vibrant-3d`
            : isDark ? "btn-3d-dark" : "btn-3d-slate"
        } ${
          liquidGlass 
            ? `rounded-[23px] ${
                liquidGlass === "tinted" 
                  ? `${isActive ? "bg-purple-600/90" : "bg-white/80"} backdrop-blur-md border-white/20` 
                  : `${isActive ? "bg-purple-600/40" : "bg-white/5"} backdrop-blur-2xl border-white/10`
              }` 
            : "rounded-[23px] backdrop-blur-none"
        }`}
      >
        {isMaintenance && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-20 shadow-lg">
            BẢO TRÌ
          </div>
        )}
        {isComingSoon && isVTV6 && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg z-20 shadow-lg">
            {getVTV6Days()}d
          </div>
        )}
        {isComingSoon && !isVTV6 && (
          <div className="absolute top-2 left-2 bg-blue-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-20 shadow-lg uppercase">
            SẮP RA MẮT
          </div>
        )}
        <ChannelLogo src={ch.logo} alt={ch.name} className={`w-full h-full transition-transform duration-500`} isDark={isDark} liquidGlass={liquidGlass} status={ch.status} />
      </motion.button>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleFavorite(ch); }}
        className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-10 ${
          favorites.includes(ch.name) ? "text-red-500 bg-red-50/20" : "text-white bg-black/20"
        }`}
      >
        <LikeIcon size={16} filled={favorites.includes(ch.name)} />
      </button>
    </div>
  );
}


const Countdown = ({ targetDate, isDark }: { targetDate: string, isDark: boolean }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      };
    };

    setTimeLeft(calculate());
    const timer = setInterval(() => setTimeLeft(calculate()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex gap-4">
      {[
        { val: timeLeft.days, unit: "Ngày" },
        { val: timeLeft.hours, unit: "Giờ" },
        { val: timeLeft.minutes, unit: "Phút" },
        { val: timeLeft.seconds, unit: "Giây" }
      ].map((item, idx) => (
        <div key={idx} className="flex flex-col items-center">
          <div className={`text-4xl font-bold tracking-tighter ${isDark ? "text-white" : "text-black"}`}>
            {item.val.toString().padStart(2, '0')}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40">
            {item.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

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
                alt="26M6"
                className="w-4 h-4 object-contain"
                referrerPolicy="no-referrer"
              />
              {slides[slideIndex].tag}
            </div>
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-5xl font-bold tracking-tighter text-white uppercase leading-tight max-w-2xl"
            >
              {slides[slideIndex].title}
            </motion.h1>
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
            <motion.h1 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Gợi ý cho bạn
            </motion.h1>
          </div>
        </div>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
          {randomChannels.map((ch, idx) => (
            <ChannelCard 
              key={`home-random-${ch.name}-${idx}`} 
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

      {/* Premium Guest Loyalty Banner - Replaced with Explore Style */}
      {!user && !bypassed && (
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`p-10 md:p-16 rounded-[64px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl transition-all border ${isDark ? "bg-purple-600/10 border-white/5" : "bg-purple-50 border-purple-100"}`}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] -ml-32 -mb-32" />
          
          <div className="relative z-10 space-y-6 text-center md:text-left flex-1">
            <div className={`inline-flex items-center gap-3 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-600"}`}>
              <Crown size={14} /> VIP Membership
            </div>
            <h2 className={`text-4xl md:text-6xl font-bold tracking-tight leading-[0.95] ${isDark ? "text-white" : "text-slate-900"}`}>
              Khám phá nhiều hơn <br /> 
              <span className="text-purple-500">với Vplay Beta</span>
            </h2>
            <p className={`max-w-xl font-medium text-base md:text-lg leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Đăng nhập ngay để đồng bộ các kênh yêu thích của bạn, nhận được đề xuất chính xác nhất từ hệ thống AI và trải nghiệm tốc độ truyền tải vượt trội.
            </p>
          </div>
          
          <div className="relative z-10 shrink-0 w-full md:w-auto">
            <button 
              onClick={onLogin} 
              className="w-full md:w-auto btn-vibrant-3d px-16 py-7 text-xl font-bold tracking-widest !rounded-[40px] !border-none !bg-purple-600 hover:!bg-purple-500 shadow-[0_20px_50px_rgba(147,51,234,0.3)]"
            >
              ĐĂNG NHẬP
            </button>
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
          <motion.h3 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
          >
            XEM VPLAY MỌI NƠI
          </motion.h3>
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
          <motion.h3 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
          >
            TỐC ĐỘ 4K SIÊU NHANH
          </motion.h3>
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
                <LikeIcon size={18} />
              </div>
            <motion.h3 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-3xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Truy cập nhanh
            </motion.h3>
            </div>
          </div>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {favoriteChannels.map(ch => (
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
      )}

    </div>
  );
}

function ExploreContent({
  isDark,
  searchQuery,
  setSearchQuery,
  setActiveChannel,
  favorites,
  toggleFavorite,
  liquidGlass,
  user,
  onLogin,
  onLogout,
  setActiveTab,
  setIsDark,
  setLiquidGlass,
  setSortOrder,
  bypassed,
  loadingTreatment,
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  sidebarDisplay,
  setSidebarDisplay,
  isPinningEnabled,
  setIsPinningEnabled,
  featureFlags,
  setFeatureFlags,
  setIsSidebarLocked
}: {
  isDark: boolean,
  searchQuery: string,
  setSearchQuery: (q: string) => void,
  setActiveChannel: (ch: Channel) => void,
  favorites: string[],
  toggleFavorite: (ch: Channel) => void,
  liquidGlass: "glassy" | "tinted",
  user: any,
  onLogin: () => void,
  onLogout: () => void,
  setActiveTab: (tab: string) => void,
  setIsDark: (val: boolean) => void,
  setLiquidGlass: (val: "glassy" | "tinted") => void,
  setSortOrder: (val: "az" | "za") => void,
  bypassed: boolean,
  loadingTreatment: string,
  useSidebar: boolean,
  setUseSidebar: (val: boolean) => void,
  isSidebarRight: boolean,
  setIsSidebarRight: (val: boolean) => void,
  sidebarDisplay: "float" | "attach",
  setSidebarDisplay: (val: "float" | "attach") => void,
  isPinningEnabled: boolean,
  setIsPinningEnabled: (val: boolean) => void,
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: any) => void,
  setIsSidebarLocked: (val: boolean) => void
}) {
  const [randomRows, setRandomRows] = useState<Channel[][]>([]);
  const [randomSettings, setRandomSettings] = useState<any[]>([]);

  useEffect(() => {
    // Generate 3 rows of random suggested channels
    const shuffled = [...channels].sort(() => 0.5 - Math.random());
    setRandomRows([
      shuffled.slice(0, 6),
      shuffled.slice(6, 12),
      shuffled.slice(12, 18)
    ]);

    // Recommended settings options
    const settingsOptions = [
       { name: "Chế độ tối", icon: Moon, action: () => setIsDark(!isDark), desc: "Tùy chỉnh giao diện bảo vệ mắt" },
       { name: "Hiệu ứng kính", icon: Layers, action: () => setLiquidGlass(liquidGlass === "glassy" ? "tinted" : "glassy"), desc: "Bật/Tắt hiệu cực mờ Liquid Glass" },
       { name: "Sắp xếp A-Z", icon: Filter, action: () => setSortOrder("az"), desc: "Sắp xếp kênh theo thứ tự bảng chữ cái" },
       { name: "Sidebar Float", icon: Columns, action: () => {}, desc: "Thay đổi giao diện thanh điều hướng" },
       { name: "Phòng thí nghiệm", icon: ExperimentalIcon, action: () => setActiveTab("Experimental"), desc: "Trải nghiệm các tính năng thử nghiệm mới" },
       { name: "Cập nhật", icon: Zap, action: () => setActiveTab("Update Logs"), desc: "Xem nhật ký thay đổi của hệ thống" }
    ];
    setRandomSettings([...settingsOptions].sort(() => 0.5 - Math.random()).slice(0, 3));
  }, [isDark, liquidGlass, setIsDark, setLiquidGlass, setSortOrder, setActiveTab]);

  return (
    <div className="flex-1 flex flex-col pt-4 overflow-y-auto scrollbar-hide pb-32">
      {/* Trending Searches */}
      {!useSidebar && (
        <div className="max-w-4xl mx-auto w-full px-4 mb-16">
          <SearchBar 
            isDark={isDark} 
            query={searchQuery} 
            setQuery={setSearchQuery} 
            onClose={() => setSearchQuery("")} 
            liquidGlass={liquidGlass}
          />
          <div className="flex flex-wrap items-center gap-2 mt-5 px-3 overflow-hidden">
              <div className="flex items-center gap-2 mr-2">
                  <Sparkles size={12} className="text-purple-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Đề xuất:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {["VTV1", "VTV3", "HBO", "K+ Action", "Discovery", "Bóng đá", "Phim Mới", "Hoạt Hình", "Chế độ tối", "Kính lỏng", "Sắp xếp A-Z", "Cập nhật", "Phòng thí nghiệm"].sort(() => 0.5 - Math.random()).slice(0, 6).map((kw, i) => (
                    <motion.button 
                        key={`explore-kw-${kw}-${i}`} 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 100, damping: 15 }}
                        onClick={() => setSearchQuery(kw)}
                        className={`text-[10px] font-bold px-4 py-1.5 rounded-full border transition-all ${isDark ? "border-white/10 hover:bg-white/10 text-white/60 hover:text-white" : "border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                    >
                        {kw}
                    </motion.button>
                ))}
              </div>
          </div>
        </div>
      )}

      <div className={`${useSidebar ? "mt-4" : "max-w-7xl"} mx-auto w-full px-4 md:px-8 space-y-20`}>
        {searchQuery.trim() !== "" ? (
          <div className="max-w-6xl mx-auto w-full">
            <SearchPopup 
              isDark={isDark} 
              searchQuery={searchQuery} 
              setActiveChannel={setActiveChannel} 
              onClose={() => setSearchQuery("")} 
              favorites={favorites}
              liquidGlass={liquidGlass}
              setActiveTab={setActiveTab}
              setIsDark={setIsDark}
              setLiquidGlass={setLiquidGlass}
              onLogin={onLogin}
              onLogout={onLogout}
              setSortOrder={setSortOrder}
              loadingTreatment={loadingTreatment}
              asContent
              useSidebar={useSidebar}
              setUseSidebar={setUseSidebar}
              isSidebarRight={isSidebarRight}
              setIsSidebarRight={setIsSidebarRight}
              sidebarDisplay={sidebarDisplay}
              setSidebarDisplay={setSidebarDisplay}
              isPinningEnabled={isPinningEnabled}
              setIsPinningEnabled={setIsPinningEnabled}
              featureFlags={featureFlags}
              setFeatureFlags={setFeatureFlags}
              setIsSidebarLocked={setIsSidebarLocked}
              setSearchQuery={setSearchQuery}
            />
          </div>
        ) : (
          <>
            {!user && !bypassed && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-10 rounded-[48px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl ${isDark ? "bg-purple-600/10 border border-white/5" : "bg-purple-50 border border-purple-100"}`}
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-500 text-[10px] font-bold uppercase tracking-widest">
                    <Crown size={12} /> Membership
                  </div>
                  <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Khám phá nhiều hơn với Vplay</h2>
                  <p className={`max-w-md font-medium text-sm md:text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>Đăng nhập ngay để đồng bộ các kênh yêu thích của bạn và nhận được đề xuất chính xác nhất từ hệ thống AI.</p>
                </div>
                <button 
                  onClick={onLogin} 
                  className="relative z-10 btn-vibrant-3d px-12 py-5 text-lg font-bold tracking-widest shrink-0 !rounded-[32px] !border-none !bg-purple-600 hover:!bg-purple-500"
                >
                  ĐĂNG NHẬP
                </button>
              </motion.div>
            )}

            {randomRows.map((row, idx) => (
              <div key={idx} className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${idx === 0 ? "bg-amber-500/10 text-amber-500" : idx === 1 ? "bg-blue-500/10 text-blue-500" : "bg-purple-500/10 text-purple-500"}`}>
                        {idx === 0 ? <Sparkles size={20} /> : idx === 1 ? <TrendingUp size={20} /> : <Zap size={20} />}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>
                          {idx === 0 ? "Kênh nổi bật" : idx === 1 ? "Gợi ý hàng đầu" : "Có thể bạn thích"}
                      </h3>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
                  {row.map((ch, i) => (
                    <ChannelCard 
                      key={`${ch.name}-${idx}-${i}`}
                      ch={ch}
                      isDark={isDark}
                      favorites={favorites}
                      toggleFavorite={toggleFavorite}
                      liquidGlass={liquidGlass}
                      onClick={() => setActiveChannel(ch)}
                      className="hover:scale-105"
                    />
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-8">
               <div className="flex items-center gap-3 px-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-500/10 flex items-center justify-center text-slate-500">
                     <Sliders size={20} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold tracking-tighter ${isDark ? "text-white" : "text-slate-900"}`}>Tối ưu trải nghiệm</h3>
                  </div>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {randomSettings.map((s, i) => (
                    <button 
                      key={i}
                      onClick={s.action}
                      className={`p-8 rounded-[48px] border text-left group transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? "bg-white/5 border-white/5 hover:bg-white/10" : "bg-slate-50 border-slate-100 hover:bg-white shadow-sm hover:shadow-xl"}`}
                    >
                       <div className={`p-4 w-fit rounded-2xl mb-6 transition-transform group-hover:rotate-6 ${isDark ? "bg-white/10 text-purple-400 font-bold" : "bg-purple-100 text-purple-600 font-bold"}`}>
                          <s.icon size={28} />
                       </div>
                       <h4 className={`text-xl font-bold mb-2 tracking-tight ${isDark ? "text-white uppercase" : "text-slate-900 uppercase"}`}>{s.name}</h4>
                       <p className={`text-sm font-medium opacity-50 ${isDark ? "text-white" : "text-slate-900"}`}>{s.desc}</p>
                    </button>
                  ))}
               </div>
            </div>
          </>
        )}
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
      className="w-full h-full object-contain bg-black" 
      autoPlay 
      playsInline
      muted={isMuted}
    />
  );
}

function TVContent({ active, setActive, isDark, favorites, toggleFavorite, user, onLogin, isDev, liquidGlass, sortOrder, setSortOrder, showSplash, featureFlags, searchQuery, bypassed, setIsPlayerInView, loadingTreatment, currentTime }: { 
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
  setIsPlayerInView: (val: boolean) => void,
  loadingTreatment: string,
  currentTime: Date
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

  const timeString = (currentTime || new Date()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
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
    <div className="flex-1 p-2 md:p-6 w-full max-w-full overflow-x-hidden">
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
            <SearchIcon size={18} className={`transition-colors ${isDark ? "text-slate-500 group-focus-within:text-purple-400" : "text-slate-400 group-focus-within:text-purple-600"}`} />
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
                  key={`${c.name}-${c.stream}`}
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
                    <SignInIcon size={16} />
                  </div>
                </button>
              ))
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="inline-flex p-4 rounded-full bg-slate-500/10 text-slate-500">
                  <SearchIcon size={32} />
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
        className={`bg-black mb-4 md:mb-6 flex items-center justify-center border shadow-2xl relative overflow-hidden group w-full max-w-full ${
        isMultiview ? "aspect-auto min-h-[300px] md:min-h-[400px]" : "aspect-video"
      } ${
        liquidGlass ? "rounded-xl md:rounded-2xl" : "rounded-lg"
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
              <div key={`multiview-slot-${idx}-${ch?.name || 'empty'}`} className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border border-white/5 group/slot">
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
                      <TvIcon size={32} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Trống</span>
                  </div>
                )}
                
                {/* Individual Control Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    {ch && <ChannelLogo src={ch.logo} alt={ch.name} className="w-5 h-5" isDark={true} />}
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
            {active.status === "maintenance" || active.status === "coming-soon" ? (
              <div className="absolute inset-0 w-full h-full bg-[#0a0a0a] flex flex-col items-center justify-center p-8 overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-6"
                >
                  <ChannelLogo src={active.logo} alt={active.name} className="w-48 h-48 md:w-64 md:h-64" isDark={true} />
                  <div className="space-y-1">
                    <p className="text-white/60 text-lg md:text-xl font-medium">Kênh chưa tồn tại trong hệ thống</p>
                  </div>
                </motion.div>
              </div>
            ) : (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
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
                <div className="p-4 md:p-10 pointer-events-auto">
                   <div className="flex items-center gap-4">
                      <div className="p-2 md:p-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-xl md:rounded-2xl flex items-center justify-center">
                         <img src={active.logo} alt={active.name} className="h-6 w-6 md:h-10 md:w-10 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="space-y-0.5 md:space-y-1">
                        <h4 className="text-lg md:text-2xl font-bold tracking-tighter text-white uppercase">{active.name}</h4>
                        <div className="flex items-center gap-2 md:gap-3">
                          <span className="text-[8px] md:text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-purple-500/10 px-1.5 md:px-2 py-0.5 rounded-md border border-purple-500/10">{active.category}</span>
                          <div className="flex items-center gap-1 text-[8px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest">
                             <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-green-500 animate-pulse" />
                             LIVE 4K
                          </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-4 md:p-10 pointer-events-auto">
                   <div className={`p-2 md:p-4 rounded-[24px] md:rounded-[32px] border border-white/10 flex items-center justify-between gap-2 md:gap-6 backdrop-blur-3xl shadow-2xl ${liquidGlass === "tinted" ? "bg-white/80" : "bg-black/30"}`}>
                      <div className="flex items-center gap-2 md:gap-3">
                         <button onClick={togglePlay} className={`p-3 md:p-4 rounded-xl md:rounded-2xl transition-all hover:scale-105 active:scale-95 ${liquidGlass === "tinted" ? "bg-black text-white" : "bg-white text-black"}`}>
                            {isPlaying ? <Pause size={20} className="md:w-6 md:h-6" fill="currentColor" /> : <Play size={20} className="md:w-6 md:h-6" fill="currentColor" />}
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

                      <div className="flex items-center gap-2 md:gap-4">
                          {featureFlags.screen_recording && (
                             <button 
                               onClick={toggleRecording}
                               className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                                 isRecording
                                   ? "bg-red-600 border-red-500 text-white shadow-lg animate-pulse"
                                   : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                               }`}
                               title={searchQuery.trim().length > 0 ? "Search results" : (isRecording ? "Dừng ghi" : "Ghi màn hình")}
                             >
                               {isRecording ? <Square size={18} className="md:w-5 md:h-5" fill="currentColor" /> : <Circle size={18} className="md:w-5 md:h-5" fill="currentColor" />}
                             </button>
                          )}
                          {featureFlags.multiview_channels && (
                            <div className="relative">
                              <button 
                                onClick={() => setShowLayoutMenu(!showLayoutMenu)}
                                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                                  isMultiview
                                    ? "bg-purple-600 border-purple-500 text-white shadow-lg"
                                    : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                                }`}
                                title="Multiview"
                              >
                                <LayoutGrid size={18} className="md:w-5 md:h-5" />
                              </button>
                              <AnimatePresence>
                                {showLayoutMenu && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className={`absolute bottom-full mb-6 right-0 min-w-[200px] md:min-w-[240px] z-50 p-4 md:p-6 space-y-4 md:space-y-6 ${
                                      isDark ? "popup-3d-dark" : "popup-3d-light"
                                    } ${liquidGlass ? "backdrop-blur-3xl" : "backdrop-blur-none"}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-slate-500"}`}>Enable Multiview</span>
                                      <button 
                                        onClick={toggleMultiview}
                                        className={`w-10 h-5 md:w-12 md:h-6 rounded-full transition-all relative ${isMultiview ? "bg-purple-600" : "bg-slate-700"}`}
                                      >
                                        <motion.div 
                                          animate={{ x: isMultiview ? 22 : 4 }}
                                          className="absolute top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white shadow-sm"
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
                                            className={`p-2 rounded-lg text-[10px] md:text-xs font-bold transition-all ${multiviewCount === n ? "bg-purple-600 text-white shadow-[0_4px_12px_rgba(147,51,234,0.3)]" : "bg-white/5 text-white/60 hover:bg-white/10"}`}
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
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                              favorites.includes(active.name)
                                ? "bg-red-500/10 border-red-500 text-red-500"
                                : liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"
                            }`}
                          >
                            <LikeIcon size={20} filled={favorites.includes(active.name)} />
                          </button>
                         <button onClick={toggleFullscreen} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${liquidGlass === "tinted" ? "bg-black/5 border-black/10 text-black" : "bg-white/5 border-white/10 text-white"}`}>
                            <Maximize size={18} className="md:w-5 md:h-5" />
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 mt-4 md:mt-0">
        <div className="flex flex-col gap-1 md:gap-2">
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl md:text-4xl font-bold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-950"}`}
            >
              {active.name}
            </motion.h2>
            <div className="flex items-center gap-2">
              {isMaintenance ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-bold tracking-widest flex items-center gap-1.5 md:gap-2">
                  <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-amber-500"></div>
                  ĐANG BẢO TRÌ
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[8px] md:text-[10px] px-2 md:px-3 py-1 rounded-full font-bold tracking-widest flex items-center gap-1.5 md:gap-2">
                  <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-red-500 animate-pulse"></div>
                  ĐANG TRỰC TIẾP
                </div>
              )}
            </div>
          </div>
          <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest ml-1">Đang phát sóng: {active.category}</p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
           {featureFlags.screen_recording && (
             <button 
               onClick={toggleRecording}
               className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                 isRecording
                   ? "bg-red-600 border-red-500 text-white shadow-lg animate-pulse"
                   : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
               }`}
               title={isRecording ? "Dừng ghi" : "Ghi màn hình"}
             >
               {isRecording ? <Square size={16} fill="currentColor" /> : <Circle size={16} fill="currentColor" />}
             </button>
           )}
           {featureFlags.multiview_channels && (
             <button 
               onClick={toggleMultiview}
               className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                 isMultiview
                   ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20"
                   : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
               }`}
             >
               <LayoutGrid size={16} />
             </button>
           )}
           <button 
             onClick={() => toggleFavorite(active)}
             className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
               favorites.includes(active.name)
                 ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20"
                 : isDark ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
             }`}
           >
             <LikeIcon size={16} filled={favorites.includes(active.name)} />
           </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mt-8 md:mt-12">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex gap-2 overflow-x-auto pb-4 md:pb-0 no-scrollbar flex-1 -mx-4 px-4 md:mx-0 md:px-0">
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
        <div className="space-y-12 md:space-y-16">
                {filteredCategories.map((cat, catIdx) => (
            <div key={`${cat}-${catIdx}`} className="space-y-6 md:space-y-8">
              <div className="flex items-center gap-3 md:gap-4 px-2">
                <div className="h-6 md:h-8 w-1 md:w-1.5 bg-purple-500 rounded-full" />
                <div>
                  <h3 className={`text-xl md:text-3xl font-bold tracking-tighter uppercase ${isDark ? "text-white" : "text-slate-900"}`}>{cat}</h3>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3 md:gap-6">
                {cat === "Phát thanh" ? (
                  <div className={`col-span-full p-12 rounded-[40px] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${
                    isDark ? "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10" : "border-black/5 bg-black/5 text-slate-500 hover:bg-black/[0.02]"
                  }`}>
                    <div className="p-4 rounded-3xl bg-purple-500/10 text-purple-500">
                      <Sparkles size={32} className="animate-pulse" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-xl tracking-tighter uppercase mb-1">Coming Soon!</p>
                      <p className="text-xs font-medium opacity-60">Tính năng đang được phát triển để mang lại trải nghiệm âm thanh tốt nhất.</p>
                    </div>
                  </div>
                ) : (
                  filteredChannels.filter(c => c.category === cat).map((ch, chIdx) => (
                    <ChannelCard 
                      key={`tv-${cat}-${ch.name}-${chIdx}`} 
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
            <div className="text-center py-20 flex flex-col items-center justify-center space-y-6">
              <div className="w-16 h-16 relative flex items-center justify-center">
                 <LoadingSpinner isDark={isDark} className="w-14 h-14" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>Đang tìm kiếm...</h3>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Đang nỗ lực tải kết quả mới nhất</p>
              </div>
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
  setSortOrder,
  loadingTreatment,
  asContent,
  useSidebar,
  setUseSidebar,
  isSidebarRight,
  setIsSidebarRight,
  sidebarDisplay,
  setSidebarDisplay,
  isPinningEnabled,
  setIsPinningEnabled,
  featureFlags,
  setFeatureFlags,
  setIsSidebarLocked,
  setSearchQuery
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
  setSortOrder: (val: "az" | "za") => void,
  loadingTreatment: string,
  asContent?: boolean,
  useSidebar?: boolean,
  setUseSidebar?: (val: boolean) => void,
  isSidebarRight?: boolean,
  setIsSidebarRight?: (val: boolean) => void,
  sidebarDisplay?: "float" | "attach",
  setSidebarDisplay?: (val: "float" | "attach") => void,
  isPinningEnabled?: boolean,
  setIsPinningEnabled?: (val: boolean) => void,
  featureFlags?: { [key: string]: boolean },
  setFeatureFlags?: (val: any) => void,
  setIsSidebarLocked?: (val: boolean) => void,
  setSearchQuery?: (val: string) => void
}) {
  if (searchQuery.trim() === "" && !asContent) return null;

  const filteredChannels = channels.filter(ch => 
    ch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ch.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const systemItems = [
    { name: "Trang chủ", type: "tab", icon: HomeIcon, action: () => setActiveTab("Trang chủ") },
    { name: "Phát sóng", type: "tab", icon: TvIcon, action: () => setActiveTab("Phát sóng") },
    { name: "Khám phá", type: "tab", icon: SearchIcon, action: () => setActiveTab("Khám phá") },
    { name: "Lưu trữ", type: "tab", icon: FolderIcon, action: () => setActiveTab("Lưu trữ") },
    { name: "Thử nghiệm", type: "tab", icon: ExperimentalIcon, action: () => setActiveTab("Experimental") },
    { name: "Phòng thí nghiệm", type: "tab", icon: ExperimentalIcon, action: () => setActiveTab("Experimental") },
    { name: "Cài đặt", type: "tab", icon: SettingsIcon, action: () => setActiveTab("Cài đặt") },
    { name: "Quản trị", type: "tab", icon: ShieldCheck, action: () => setActiveTab("Quản trị") },
    { name: "Tài khoản", type: "tab", icon: AccountIcon, action: () => setActiveTab("Tài khoản") },
    { name: "Cộng đồng", type: "tab", icon: CommunityIcon, action: () => setActiveTab("Cài đặt") },
    { name: "Nhật ký cập nhật", type: "tab", icon: Zap, action: () => setActiveTab("Update Logs") },
    
    { name: "Chế độ tối", type: "setting", icon: Moon, action: () => setIsDark(true) },
    { name: "Chế độ sáng", type: "setting", icon: Sun, action: () => setIsDark(false) },
    { name: "Sidebar Trái", type: "setting", icon: Columns, action: () => setIsSidebarRight?.(false) },
    { name: "Sidebar Phải", type: "setting", icon: Columns, action: () => setIsSidebarRight?.(true) },
    { name: "Khóa Sidebar", type: "setting", icon: Lock, action: () => (setIsSidebarLocked as any)?.(true) },
    { name: "Mở khóa Sidebar", type: "setting", icon: Unlock, action: () => (setIsSidebarLocked as any)?.(false) },
    { name: "Sidebar Lơ lửng", type: "setting", icon: Layers, action: () => setSidebarDisplay?.("float") },
    { name: "Sidebar Chạm góc", type: "setting", icon: Layout, action: () => setSidebarDisplay?.("attach") },
    { name: "Hiệu ứng Liquid Glass", type: "setting", icon: Layers, action: () => setLiquidGlass(liquidGlass === "glassy" ? "tinted" : "glassy") },
    
    { name: "Bật Truy cập nhanh", type: "toggle", icon: Pin, action: () => setIsPinningEnabled?.(true) },
    { name: "Tắt Truy cập nhanh", type: "toggle", icon: Pin, action: () => setIsPinningEnabled?.(false) },
    { name: "Bật Giảm chuyển động", type: "toggle", icon: Zap, action: () => setFeatureFlags?.((prev: any) => ({ ...prev, disable_animation: true })) },
    { name: "Tắt Giảm chuyển động", type: "toggle", icon: Zap, action: () => setFeatureFlags?.((prev: any) => ({ ...prev, disable_animation: false })) },
    
    { name: "Lọc kênh VTV", type: "button", icon: Filter, action: () => { onClose(); (document.querySelector('input') as HTMLInputElement).value = "VTV"; setSearchQuery?.("VTV"); } },
    { name: "Lọc kênh Phim", type: "button", icon: Film, action: () => { onClose(); (document.querySelector('input') as HTMLInputElement).value = "Phim"; setSearchQuery?.("Phim"); } },
    { name: "Lọc kênh Bóng đá", type: "button", icon: Zap, action: () => { onClose(); (document.querySelector('input') as HTMLInputElement).value = "Bóng đá"; setSearchQuery?.("Bóng đá"); } },
    
    { name: "Cài đặt nâng cao", type: "button", icon: SettingsIcon, action: () => setActiveTab("Cài đặt") },
    { name: "Quản lý kênh", type: "button", icon: ShieldCheck, action: () => setActiveTab("Quản trị") },
    { name: "Tìm kiếm mở rộng", type: "button", icon: SearchIcon, action: () => setActiveTab("Khám phá") },
    
    { name: "Đăng nhập", type: "button", icon: SignInIcon, action: onLogin },
    { name: "Đăng xuất", type: "button", icon: SignOutIcon, action: onLogout },
    { name: "Sắp xếp A-Z", type: "toggle", icon: Filter, action: () => setSortOrder("az") },
    { name: "Sắp xếp Z-A", type: "toggle", icon: Filter, action: () => setSortOrder("za") },
    
    { name: "Thời tiết hôm nay", type: "element", icon: Cloud, action: () => setActiveTab("Trang chủ") },
    { name: "Đồng hồ hệ thống", type: "element", icon: Clock, action: () => setActiveTab("Trang chủ") },
    { name: "Kênh đã ghim", type: "element", icon: Pin, action: () => setActiveTab("Phát sóng") },
    { name: "Người dùng đăng nhập", type: "element", icon: User, action: onLogin },
    { name: "Bảng điều khiển", type: "element", icon: Layout, action: () => setActiveTab("Quản trị") },
    { name: "Liên hệ hỗ trợ", type: "element", icon: Info, action: () => setActiveTab("Cài đặt") },
    
    { name: "/force launch loading", type: "command", icon: Zap, action: () => {} },
    { name: "/force launch oobe", type: "command", icon: Zap, action: () => {} },
    { name: "/help", type: "command", icon: Info, action: () => {} },
    { name: "/bypass", type: "command", icon: Shield, action: () => {} },
    { name: "devmode", type: "command", icon: Terminal, action: () => {} },
  ];

  const isHelpCommand = searchQuery.trim().toLowerCase() === "/help";
  const filteredSystem = isHelpCommand 
    ? systemItems.filter(item => ["command", "setting", "button", "tab"].includes(item.type))
    : systemItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const favoriteChannels = channels.filter(ch => favorites.includes(ch.name));

  return (
    <motion.div
      initial={asContent ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      animate={asContent ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      exit={asContent ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.8, rotateX: -15 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={`${
        asContent 
          ? "relative w-full overflow-visible" 
          : `absolute bottom-full mb-8 w-[90vw] md:w-full max-w-[400px] overflow-hidden ${
              isDark ? "popup-3d-dark" : "popup-3d-light"
            } ${liquidGlass ? "backdrop-blur-xl" : "backdrop-blur-none"}`
      }`}
    >
      <div className={`${asContent ? "space-y-12 pb-10" : "p-4 space-y-1 max-h-[60vh] overflow-y-auto"}`}>
        {asContent && <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-slate-200"}`} />}
        
        {searchQuery.trim() === "" ? (
          <div className="space-y-4">
            {favoriteChannels.length > 0 && (
              <div className="space-y-2">
                <div className="px-4 py-2 flex items-center gap-2">
                  <LikeIcon size={12} filled={true} className="text-red-500" />
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Kênh yêu thích</p>
                </div>
                {favoriteChannels.map((ch, idx) => (
                  <button
                    key={`search-fav-${ch.name}-${idx}`}
                    onClick={() => { setActiveChannel(ch); onClose(); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group hover:bg-black/5`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-slate-100 border-slate-200`}>
                      <img src={ch.logo} alt={ch.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm ${isDark ? "text-white" : "text-black"}`}>{ch.name}</p>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isDark ? "text-white/20" : "text-black/30"}`} />
                  </button>
                ))}
              </div>
            )}
            <div className={`py-8 text-center space-y-3 ${isDark ? "text-white" : "text-black"}`}>
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
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Hệ thống & Cài đặt</p>
                </div>
                <div className={asContent ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2" : "space-y-1"}>
                  {filteredSystem.map((item, idx) => (
                    <button
                      key={`search-system-${item.name}-${idx}`}
                      onClick={() => { item.action(); onClose(); }}
                      className={`w-full flex items-center gap-4 p-3 rounded-[24px] transition-all hover:scale-[1.02] active:scale-[0.98] group ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 ${isDark ? "bg-white/5 border-white/10 text-purple-400" : "bg-slate-100 border-slate-200 text-purple-600"}`}>
                        <item.icon size={24} className="fill-current" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{item.name}</p>
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-white/40" : "text-black/60"}`}>{item.type === "tab" ? "Chuyển Tab" : "Cài đặt"}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isDark ? "text-white/20" : "text-black/30"}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {asContent && filteredSystem.length > 0 && filteredChannels.length > 0 && (
               <div className={`h-[1px] w-full ${isDark ? "bg-white/10" : "bg-slate-200"} mb-8`} />
            )}

            {filteredChannels.length > 0 && (
              <div className="space-y-1">
                <div className="px-4 py-2">
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? "text-white/40" : "text-black/60"}`}>Kênh truyền hình</p>
                </div>
                <div className={asContent ? "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3" : "space-y-1"}>
                  {filteredChannels.map((ch, idx) => (
                    <button
                      key={`search-ch-${ch.name}-${idx}`}
                      onClick={() => { setActiveChannel(ch); onClose(); }}
                      className={`flex flex-col items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.95] group ${isDark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:rotate-3 ${isDark ? "bg-white/10 border-white/10" : "bg-slate-100 border-slate-200"}`}>
                        <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="text-center overflow-hidden w-full">
                        <p className={`font-bold text-[10px] truncate ${isDark ? "text-white" : "text-slate-900"}`}>{ch.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className={`py-12 text-center flex flex-col items-center justify-center space-y-4 ${isDark ? "text-white" : "text-black"}`}>
            <div className="w-12 h-12 relative flex items-center justify-center">
              {/* Show no results if not loading or just show a message */}
              <p className="text-sm font-bold opacity-60">Không tìm thấy kết quả nào cho "{searchQuery}"</p>
            </div>
            <button 
              onClick={() => setSearchQuery("")}
              className="text-[10px] font-bold uppercase tracking-widest text-purple-500 hover:underline"
            >
              Xóa tìm kiếm
            </button>
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
          <span className="text-[10px] font-bold text-white uppercase tracking-widest truncate max-w-[120px]">{channel.name}</span>
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

function AdminContent({ isDark, liquidGlass }: { isDark: boolean, liquidGlass: "glassy" | "tinted" }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
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
                    {u.photoURL ? <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover" referrerPolicy="no-referrer" /> : <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center"><AccountIcon size={16} className="text-slate-600" /></div>}
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
                      u.watchedChannels.map((chName: string, idx: number) => (
                        <span key={`${chName}-${idx}`} className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
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
      switch (loadingTreatment) {
        case "treatment1": return "https://static.wikia.nocookie.net/ftv/images/6/63/Search_uci.png/revision/latest?cb=20260411084053&path-prefix=vi";
        case "treatment3": return "https://static.wikia.nocookie.net/ftv/images/7/7f/Processing_loading.gif/revision/latest?cb=20260408134707&path-prefix=vi";
        default: return "https://static.wikia.nocookie.net/ftv/images/7/7f/Processing_loading.gif/revision/latest?cb=20260408134707&path-prefix=vi";
      }
    };

    const loadingUrl = getLoadingUrl();

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
        <LoadingSpinner isDark={isDark} className="w-14 h-14" />
        <span className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${isDark ? "text-white/40" : "text-slate-400"}`}>
          Đang tải dữ liệu...
        </span>
      </div>
    );
  }

  const logs = [
    {
      id: 'dev-26604',
      version: 'Vplay Dev - Build 26604',
      tag: '✨',
      type: 'PATCH',
      sections: [
        {
          title: '🔄 UPDATES',
          items: [
            'Update build version to 26604',
            'Thay logo kênh VTV1 ở các ô kênh truyền hình (ko thay trong search results)',
            'Thay icon Sign In/Sign Out sang phong cách Fluent mới'
          ],
          color: 'text-purple-500'
        }
      ]
    },
    {
      id: 'dev-26601',
      version: 'Vplay Dev - Build 26604',
      tag: '✨',
      type: '',
      sections: [
        {
          title: '🎨 Giao diện & Trải nghiệm',
          items: [
            'Cập nhật giao diện Giao diện & Trải nghiệm với phong cách nút bấm lớn',
            'Tối ưu hóa màu sắc Search Box và Sidebar cho cả hai chế độ sáng/tối (Search Box: Xám/Dark Gray, Sidebar: Đen/Trắng)',
            'Điều chỉnh kiểu chữ và định dạng văn bản trong phần Cài đặt: font Bold, không in hoa',
            'Sắp xếp lại layout mỗi option một dòng trong mục Giao diện'
          ],
          color: 'text-purple-500'
        }
      ]
    }, {
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
            'Cấu trúc lại trang Cài đặt: Phần Thông tin giờ được đặt cạnh Tài khoản và Cộng đồng',
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
                className={`btn-3d-slate btn-3d-square w-14 h-14`}
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className={`text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Changelogs</h2>
            </div>

            <div className={`relative group min-w-[280px] transition-all`}>
              <div className={`flex items-center ${isDark ? "btn-3d-dark" : "btn-3d-slate"} px-4 py-3 h-14`}>
                <SearchIcon className={`mr-3 transition-colors ${isDark ? "text-white/20 group-focus-within:text-purple-400" : "text-slate-400 group-focus-within:text-purple-600"}`} size={16} />
                <input 
                  value={logSearchQuery}
                  onChange={e => setLogSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm version..."
                  className={`flex-1 text-sm bg-transparent focus:outline-none transition-all ${
                    isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>
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
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed font-medium`}>
                  Thử nghiệm, vẫn khá lỗi nhưng tính năng hoàn thiện hơn so với Canary. Được cập nhật thường xuyên, tính năng ổn định sẽ được đưa vào dưới Features Lab.
                </p>
              </div>
              <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-100 shadow-sm"} space-y-3`}>
                <div className="flex items-center gap-2 text-yellow-500">
                  <div className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-sm font-bold uppercase tracking-widest">Vplay Canary</span>
                </div>
                <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed font-medium`}>
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

function ExperimentalContent({ isDark, featureFlags, setFeatureFlags, liquidGlass, loadingTreatment, setLoadingTreatment }: { 
  isDark: boolean, 
  featureFlags: { [key: string]: boolean },
  setFeatureFlags: (val: { [key: string]: boolean } | ((prev: { [key: string]: boolean }) => { [key: string]: boolean })) => void,
  liquidGlass: "glassy" | "tinted",
  loadingTreatment: string,
  setLoadingTreatment: (val: string) => void
}) {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-12 pb-32">
      <div className={`p-8 rounded-[32px] border-2 transition-all shadow-xl rotate-[-1deg] ${
        isDark ? "bg-amber-500/10 border-amber-500/20 text-amber-500" : "bg-amber-50 border-amber-200 text-amber-700"
      }`}>
        <div className="flex items-start gap-5">
          <div className={`p-3 rounded-2xl ${isDark ? "bg-amber-500/20" : "bg-amber-100"}`}>
            <AlertCircle size={28} className="shrink-0" />
          </div>
          <div className="space-y-2">
            <h4 className="text-xl font-bold tracking-tight">Cảnh báo rủi ro</h4>
            <p className="text-sm font-bold leading-relaxed opacity-90">Các tính năng thử nghiệm có thể chưa ổn định và có thể gây lỗi treo ứng dụng. Chúng tôi khuyến nghị bạn nên sử dụng cẩn thận trên các thiết bị có cấu hình yếu.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-[2px_2px_0_0_rgba(147,51,234,0.4)] rotate-3">
            <ExperimentalIcon size={28} />
          </div>
          <div>
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Experimental Labs</h2>
          </div>
        </div>
      </div>

      <div className={`rounded-[32px] md:rounded-[40px] overflow-hidden border-2 transition-all ${isDark ? "bg-white/5 border-white/10 shadow-2xl" : "bg-white border-slate-200 shadow-xl"}`}>
        {EXPERIMENTS.map((exp, idx) => (
          <div key={`exp-tab-${exp.id}`}>
            <div className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 md:p-12 transition-all hover:bg-black/5 gap-6`}>
              <div className="flex flex-col sm:flex-row items-start gap-6 text-left">
                <div className={`p-4 md:p-5 rounded-3xl shrink-0 ${isDark ? "bg-white/5 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <ExperimentalIcon size={32} />
                </div>
                <div className="space-y-2">
                  <p className={`text-xl md:text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{exp.name}</p>
                  <p className={`text-sm md:text-base font-bold opacity-60 leading-relaxed max-w-xl ${isDark ? "text-white" : "text-slate-500"}`}>{exp.desc || "Nâng cấp trải nghiệm hệ thống với các tính năng thử nghiệm mới nhất"}</p>
                  <div className="pt-2">
                    <span className={`px-3 py-1 rounded-2xl text-[10px] md:text-[12px] font-bold font-mono border-2 shadow-[0_4px_15px_-4px_rgba(234,179,8,0.3)] ${isDark ? "bg-yellow-400/20 border-yellow-400 text-yellow-400" : "bg-yellow-400 border-yellow-500 text-yellow-950"}`}>
                      REF_ID: {exp.id}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setFeatureFlags(prev => ({ ...prev, [exp.id]: !prev[exp.id] }))}
                className={`w-20 h-10 rounded-full transition-all relative border-2 shrink-0 ${featureFlags[exp.id] ? "bg-purple-600/30 border-purple-600/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: featureFlags[exp.id] ? 38 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[3px] h-[30px] w-[34px] rounded-full shadow-sm transition-colors ${featureFlags[exp.id] ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>

            {idx < EXPERIMENTS.length - 1 && <div className={`h-[1px] mx-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function RejuvenatedSettingsItem({ icon: Icon, title, description, onClick, isDark }: { icon: any, title: string, description?: string, onClick: () => void, isDark: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border group ${
        isDark 
          ? "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10" 
          : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
    >
      <div className={`p-3 rounded-lg ${isDark ? "bg-white/5 text-purple-400" : "bg-purple-50 text-purple-600"}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 text-left">
        <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h4>
        {description && <p className="text-[11px] opacity-50 font-medium">{description}</p>}
      </div>
      <ChevronRight size={16} className={`opacity-20 group-hover:opacity-100 transition-opacity ${isDark ? "text-white" : "text-black"}`} />
    </button>
  );
}

function RejuvenatedSettings(props: any) {
  const { 
    isDark, setIsDark, isDev, setIsDev, featureFlags, setFeatureFlags, liquidGlass, setLiquidGlass,
    useSidebar, setUseSidebar, isSidebarRight, setIsSidebarRight, isSidebarLocked, setIsSidebarLocked,
    sidebarDisplay, setSidebarDisplay, isPinningEnabled, setIsPinningEnabled, user, userData,
    onAlert, onLogin, onUpdateLogsClick, favorites, bypassed, loadingTreatment,
    tempUnit, setTempUnit, location, setLocation, timeFormat, setTimeFormat, clockFormat, setClockFormat,
    dateFormat, setDateFormat, showTempInClock, setShowTempInClock, headingBar, setHeadingBar
  } = props;

  const [activeCategory, setActiveCategory] = useState("System");
  
  const categories = [
    { id: "System", name: "Hệ thống", icon: Monitor },
    { id: "Accounts", name: "Tài khoản", icon: User },
    { id: "Personalization", name: "Cá nhân hóa", icon: Palette },
    { id: "Accessibility", name: "Quyền truy cập", icon: Accessibility },
    { id: "Privacy", name: "Quyền riêng tư & bảo mật", icon: ShieldCheck },
    { id: "WindowsUpdate", name: "Vplay Update", icon: RotateCcw },
  ];

  const renderContent = () => {
    switch (activeCategory) {
      case "System":
        return (
          <div className="space-y-4">
             <RejuvenatedSettingsItem 
              icon={Sun} 
              title="Chế độ hiển thị" 
              description={`Hiện tại: ${isDark ? "Tối" : "Sáng"}`}
              onClick={() => setIsDark(!isDark)}
              isDark={isDark}
            />
            <RejuvenatedSettingsItem 
              icon={LayoutGrid} 
              title="Thanh điều hướng (Sidebar)" 
              description="Thay đổi vị trí và cách hiển thị của sidebar"
              onClick={() => setUseSidebar(!useSidebar)}
              isDark={isDark}
            />
            <RejuvenatedSettingsItem 
              icon={Smartphone} 
              title="Chế độ hiển thị Top Bar" 
              description={headingBar ? "Đang bật" : "Đang tắt"}
              onClick={() => setHeadingBar(!headingBar)}
              isDark={isDark}
            />
            <RejuvenatedSettingsItem 
              icon={Flask} 
              title="Tính năng thử nghiệm" 
              description="Quản lý các bản thử nghiệm beta"
              onClick={() => {}} // Could expand to show sub-list
              isDark={isDark}
            />
          </div>
        );
      case "Accounts":
        return (
          <div className="space-y-4">
            <div className={`p-8 rounded-3xl border flex items-center gap-6 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
               <img src={user?.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop"} className="w-24 h-24 rounded-full border-4 border-white/10" />
               <div className="space-y-1">
                  <h3 className="text-2xl font-bold">{user?.displayName || "Người dùng Vplay"}</h3>
                  <p className="opacity-50 text-sm">{user?.email || "Chưa xác minh email"}</p>
                  <div className="pt-2 flex gap-2">
                     <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-md uppercase">Vip Membership</span>
                     <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-md uppercase">Beta Tester</span>
                  </div>
               </div>
            </div>
            <RejuvenatedSettingsItem 
              icon={Monitor} 
              title="Quản lý hồ sơ" 
              description="Chỉnh sửa tên và ảnh đại diện"
              onClick={() => onAlert("Tính năng", "Coming soon in detailed view")}
              isDark={isDark}
            />
            <RejuvenatedSettingsItem 
              icon={LogOut} 
              title="Đăng xuất" 
              description="Thoát khỏi phiên làm việc hiện tại"
              onClick={() => props.onLogout ? props.onLogout() : {}}
              isDark={isDark}
            />
          </div>
        );
      case "Personalization":
        return (
          <div className="space-y-4">
             <RejuvenatedSettingsItem 
              icon={Droplet} 
              title="Hiệu ứng Liquid Glass" 
              description={`Kiểu: ${liquidGlass}`}
              onClick={() => setLiquidGlass(liquidGlass === "glassy" ? "tinted" : "glassy")}
              isDark={isDark}
            />
            <RejuvenatedSettingsItem 
              icon={Palette} 
              title="Thay đổi vị trí Sidebar" 
              description={`Vị trí: ${isSidebarRight ? "Phải" : "Trái"}`}
              onClick={() => setIsSidebarRight(!isSidebarRight)}
              isDark={isDark}
            />
            <RejuvenatedSettingsItem 
              icon={Columns} 
              title="Kiển thị Sidebar" 
              description={`Kiểu: ${sidebarDisplay}`}
              onClick={() => setSidebarDisplay(sidebarDisplay === "float" ? "attach" : "float")}
              isDark={isDark}
            />
          </div>
        );
      case "Accessibility":
        return (
           <div className="space-y-4">
              <RejuvenatedSettingsItem 
                icon={Zap} 
                title="Giảm hiệu ứng chuyển động" 
                description={featureFlags.disable_animation ? "Đang bật" : "Đang tắt"}
                onClick={() => setFeatureFlags((prev: any) => ({ ...prev, disable_animation: !prev.disable_animation }))}
                isDark={isDark}
              />
              <RejuvenatedSettingsItem 
                icon={Pin} 
                title="Ghim kênh nhanh trên Sidebar" 
                description={isPinningEnabled ? "Đang bật" : "Đang tắt"}
                onClick={() => setIsPinningEnabled(!isPinningEnabled)}
                isDark={isDark}
              />
           </div>
        );
      case "Privacy":
        return (
          <div className="space-y-4">
            <RejuvenatedSettingsItem 
                icon={ShieldCheck} 
                title="Quyền ghi màn hình" 
                description={featureFlags.screen_recording ? "Đã cho phép" : "Đã từ chối"}
                onClick={() => setFeatureFlags((prev: any) => ({ ...prev, screen_recording: !prev.screen_recording }))}
                isDark={isDark}
              />
          </div>
        );
      case "WindowsUpdate":
        return (
          <div className="space-y-4">
             <div className={`p-8 rounded-3xl border flex items-center justify-between ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={24} />
                   </div>
                   <div>
                      <h4 className="text-xl font-bold">You're up to date</h4>
                      <p className="opacity-50 text-sm">Last checked: Today, {new Date().toLocaleTimeString()}</p>
                   </div>
                </div>
                <button className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all">Check for updates</button>
             </div>
             <RejuvenatedSettingsItem 
              icon={History} 
              title="Update history" 
              description="Xem các bản cập nhật gần đây"
              onClick={onUpdateLogsClick}
              isDark={isDark}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full gap-8 overflow-hidden pt-4">
       {/* Left sidebar for categories */}
       <div className="w-full md:w-80 flex flex-col gap-1 py-4 shrink-0 overflow-y-auto">
          <div className="px-4 mb-6 relative">
             <input 
               type="text" 
               placeholder="Tìm cài đặt..." 
               className={`w-full py-2.5 px-10 rounded-lg border-b text-sm transition-all ${isDark ? "bg-white/5 border-white/10 text-white placeholder-white/20" : "bg-black/5 border-slate-200 text-slate-900"}`}
             />
             <Search size={14} className="absolute left-7 top-1/2 -translate-y-1/2 opacity-30" />
          </div>

          <div className="space-y-0.5 px-2">
            {categories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={`cat-${cat.id}`}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all relative group ${
                    isActive 
                      ? (isDark ? "bg-white/10 text-white" : "bg-white shadow-sm text-slate-900 border border-slate-100") 
                      : (isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-slate-600 hover:text-slate-900 hover:bg-black/5")
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="catActivePill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-purple-500 rounded-r-md shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                    />
                  )}
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className={isActive ? "text-purple-500" : ""} />
                  <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>{cat.name}</span>
                </button>
              );
            })}
          </div>
       </div>

       {/* Right content area */}
       <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 pb-32">
          <div className="space-y-1 mb-8">
             <h2 className={`text-4xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
               {categories.find(c => c.id === activeCategory)?.name}
             </h2>
             {activeCategory === "System" && (
                <div className="flex items-center gap-4 mt-6">
                   <div className={`p-6 rounded-3xl border flex items-center gap-4 flex-1 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-xl">
                         <Zap size={24} />
                      </div>
                      <div>
                         <p className="text-sm font-bold truncate">Vplay Desktop</p>
                         <button className="text-xs text-purple-500 font-bold hover:underline">Rename PC</button>
                      </div>
                   </div>
                   <div className={`p-6 rounded-3xl border flex items-center gap-4 flex-1 ${isDark ? "bg-white/5 border-white/5" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                         <Cloud size={24} />
                      </div>
                      <div>
                         <p className="text-sm font-bold truncate">OneDrive</p>
                         <p className="text-xs opacity-50">Backing up files</p>
                      </div>
                   </div>
                </div>
             )}
          </div>
          
          <div className="space-y-4">
             {renderContent()}
          </div>
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
  sidebarDisplay,
  setSidebarDisplay,
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
  bypassed,
  loadingTreatment,
  setLoadingTreatment,
  tempUnit,
  setTempUnit,
  location,
  setLocation,
  timeFormat,
  setTimeFormat,
  clockFormat,
  setClockFormat,
  dateFormat,
  setDateFormat,
  showTempInClock,
  setShowTempInClock,
  headingBar,
  setHeadingBar
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
  sidebarDisplay: "float" | "attach",
  setSidebarDisplay: (val: "float" | "attach") => void,
  isPinningEnabled: boolean,
  setIsPinningEnabled: (val: boolean) => void,
  user: any,
  userData: any,
  setUserData: (val: any) => void,
  onAlert: (title: string, msg: string) => void,
  onLogin: () => void,
  onUpdateLogsClick: () => void,
  onResetOnboarding: () => void,
  favorites: string[],
  bypassed: boolean,
  loadingTreatment: string,
  setLoadingTreatment: (val: string) => void,
  tempUnit: "C" | "F",
  setTempUnit: (val: "C" | "F") => void,
  location: string,
  setLocation: (val: string) => void,
  timeFormat: "24h" | "12h",
  setTimeFormat: (val: "24h" | "12h") => void,
  clockFormat: "hh:mm:ss" | "hh:mm" | "custom",
  setClockFormat: (val: "hh:mm:ss" | "hh:mm" | "custom") => void,
  dateFormat: "dd/mm/yyyy" | "dd/mm/yy" | "dd/mm" | "custom",
  setDateFormat: (val: "dd/mm/yyyy" | "dd/mm/yy" | "dd/mm" | "custom") => void,
  showTempInClock: boolean,
  setShowTempInClock: (val: boolean) => void,
  headingBar: boolean,
  setHeadingBar: (val: boolean) => void
}) {
  const [name, setName] = useState(user?.displayName || userData?.name || "Vplay User");
  const [avatar, setAvatar] = useState(user?.photoURL || userData?.avatar || "");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "Vplay User");
      setAvatar(user.photoURL || "");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user) {
        await updateProfile(user, {
          displayName: name,
          photoURL: avatar
        });
      }
      
      const userRef = doc(db, "users", user ? user.uid : "bypassed");
      await setDoc(userRef, {
        name,
        avatar,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setUserData({ name, avatar });
      onAlert("Thành công", "Đã cập nhật thông tin cá nhân của bạn!");
    } catch (err: any) {
      onAlert("Lỗi", "Không thể lưu thông tin: " + err.message);
    }
    setSaving(false);
  };
  return (
    <div className="max-w-6xl mx-auto px-2 md:px-0 pb-32 space-y-6 md:space-y-8">
      {/* 1. Information Section (Top - Full Width) */}
      <div className={`p-6 md:p-12 rounded-[32px] md:rounded-[48px] border relative overflow-hidden transition-all ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-gradient-to-br from-purple-500/20 to-cyan-500/10 blur-[80px] md:blur-[120px] -mr-20 -mt-20 md:-mr-32 md:-mt-32" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-purple-500/10 text-purple-500">
                <Info size={24} className="md:w-7 md:h-7" />
              </div>
              <h3 className={`font-bold text-2xl md:text-3xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Thông tin hệ thống</h3>
            </div>
            
            <div className="flex items-center gap-6 md:gap-8 py-2 md:py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600/20 blur-3xl rounded-full" />
                <img 
                  src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                  className="w-28 h-28 md:w-40 md:h-40 object-contain relative z-10 drop-shadow-[0_10px_30px_rgba(168,85,247,0.4)]"
                  alt="Vplay App Logo"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1 md:space-y-2">
                <h2 className="text-3xl md:text-4xl font-bold italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                  Vplay 2026
                </h2>
                <div className="flex flex-col gap-0.5 md:gap-1">
                  <span className={`text-[9px] md:text-[10px] font-bold tracking-[0.4em] ${isDark ? "text-white/40" : "text-slate-400"}`}>June 2026 Update</span>
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[8px] md:text-[9px] font-bold rounded-md uppercase">26M6</span>
                    <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-500 text-[8px] md:text-[9px] font-bold rounded-md uppercase">Build 26604</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-4">
             <div className={`p-5 md:p-6 rounded-2xl md:rounded-3xl border flex items-center justify-between group transition-all hover:border-purple-500/30 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
               <div className="flex items-center gap-3 md:gap-4">
                 <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500">
                    <Activity size={20} className="md:w-6 md:h-6" />
                 </div>
                 <div>
                   <p className="text-[9px] md:text-[10px] font-bold opacity-40 tracking-wider">Phiên bản phát hành</p>
                   <p className={`text-base md:text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>June 2026 Update</p>
                 </div>
               </div>
               <span className="px-3 py-1.5 bg-amber-500 text-slate-900 text-[9px] md:text-[10px] font-bold rounded-lg md:rounded-xl shadow-lg shadow-amber-500/30">Build 26604</span>
             </div>

             <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex items-center gap-3 md:gap-4 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Terminal size={18} className="md:w-5 md:h-5" />
                   </div>
                   <div>
                     <p className="text-[8px] md:text-[10px] font-bold opacity-40 tracking-wider">Nhánh</p>
                     <p className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Dev</p>
                   </div>
                </div>
                <div className={`p-4 md:p-6 rounded-2xl md:rounded-3xl border flex items-center gap-3 md:gap-4 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
                   <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Zap size={18} className="md:w-5 md:h-5" />
                   </div>
                   <div>
                     <p className="text-[8px] md:text-[10px] font-bold opacity-40 tracking-wider">Bản dựng</p>
                     <p className={`text-sm md:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>26601</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-stretch">
        {/* Profile Section */}
        <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[48px] border flex flex-col transition-all ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
          <div className="flex items-center gap-4 mb-6 md:mb-10">
            <div className="p-2.5 md:p-3 rounded-xl md:rounded-2xl bg-purple-500/20 text-purple-500">
              <AccountIcon size={24} className="md:w-6 md:h-6" />
            </div>
            <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Tài khoản cá nhân</h3>
          </div>

          {!user && !bypassed ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-8 py-4">
              <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center border-4 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-white shadow-inner"}`}>
                <AccountIcon size={64} className="text-slate-400 opacity-20" />
              </div>
              <div className="space-y-2">
                <p className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Chưa đăng nhập</p>
                <p className="text-sm text-slate-500 font-medium">Đăng nhập để đồng bộ dữ liệu của bạn</p>
              </div>
              <button 
                onClick={onLogin}
                className="btn-vibrant-3d w-full py-4 text-base flex items-center justify-center gap-3"
              >
                <SignInIcon size={20} /> ĐĂNG NHẬP NGAY
              </button>
            </div>
          ) : (
            <div className="space-y-8 flex-1 flex flex-col">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="absolute inset-0 bg-purple-500/20 blur-xl rounded-full scale-125" />
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-28 h-28 rounded-[32px] object-cover border-4 border-white/10 relative z-10 shadow-2xl" referrerPolicy="no-referrer" />
                  ) : (
                    <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center border-4 relative z-10 ${isDark ? "bg-slate-800 border-slate-700" : "bg-slate-50 border-white shadow-inner"}`}>
                        <AccountIcon size={56} className="text-slate-400 opacity-20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 rounded-[32px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                    <Camera className="text-white w-8 h-8" />
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
                
                <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30 ml-2">Tên hiển thị</label>
                    <div className={`relative group rounded-[22px] overflow-hidden transition-all ${isDark ? "bg-white/5" : "bg-slate-50"}`}>
                      <input 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        placeholder="Tên của bạn..."
                        className={`w-full px-5 py-3.5 text-base font-bold bg-transparent outline-none transition-all ${
                          isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                        }`} 
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="btn-purple-3d flex-1 text-xs py-3 disabled:opacity-50 flex items-center justify-center gap-2 rounded-xl"
                    >
                      <CheckCircle2 size={16} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                    <button 
                      onClick={() => signOut(auth)}
                      className={`p-3 rounded-xl border transition-all active:translate-y-1 ${isDark ? "bg-red-500/10 border-red-500/10 text-red-500" : "bg-red-50 border-red-100 text-red-600 shadow-xl"}`}
                    >
                      <SignOutIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Community Section */}
        <div className={`p-6 md:p-10 rounded-[32px] md:rounded-[48px] border flex flex-col justify-between transition-all ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
          <div className="space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
                <CommunityIcon size={20} />
              </div>
              <h3 className={`font-bold text-xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Cộng đồng</h3>
            </div>

            <div className="space-y-3">
              <a 
                href="https://discord.gg/CNKFTUBSty" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-4 rounded-[24px] border transition-all active:scale-[0.98] group ${
                  isDark ? "bg-black/20 border-white/5 hover:bg-black/30 shadow-2xl" : "bg-slate-100/50 border-slate-100 hover:bg-slate-100 shadow-xl"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[18px] bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>THE WAVES</h4>
                    <p className={`text-[9px] opacity-60 font-bold tracking-[0.2em] leading-none mt-1`}>Official Discord</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-slate-500 group-hover:translate-x-2 transition-transform" />
              </a>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map(num => (
                  <a 
                    key={`yt-link-${num}`}
                    href={`https://www.youtube.com/@ota${num === 1 ? 'one' : 'two'}fr253`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-3.5 rounded-[20px] border text-[10px] font-bold transition-all group ${
                      isDark ? "bg-black/20 border-white/5 hover:bg-black/30 text-slate-300" : "bg-slate-100/50 border-slate-100 hover:bg-slate-100 text-slate-600 shadow-sm"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={12} fill="currentColor" />
                    </div>
                    <span className="tracking-widest uppercase">YT #{num}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Appearance & Experience */}
      <div className={`p-6 md:p-10 rounded-[32px] border flex flex-col transition-all w-full mt-8 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="flex flex-col md:flex-row items-center gap-3 mb-8 md:mb-10">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-purple-500/10 text-purple-500">
            <Palette size={24} className="md:w-6 md:h-6" />
          </div>
          <div className="text-center md:text-left">
            <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Giao diện & Trải nghiệm</h3>
          </div>
        </div>

        <div className="space-y-8 md:space-y-10">
          {/* 1. Chủ đề hệ thống */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
              <Sun size={20} className="text-amber-500" />
              <div>
                <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Chủ đề hệ thống</span>
                <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn cách hiển thị phù hợp cho mắt của bạn</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
              <button 
                onClick={() => setIsDark(false)}
                className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${!isDark ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
              >
                <div className="flex items-center gap-2">
                  <Sun size={20} className={!isDark ? "text-white" : "text-slate-400 group-hover:text-amber-500"} />
                  <span className="text-sm sm:text-base font-bold opacity-80 group-hover:opacity-100 transition-opacity">Sáng</span>
                </div>
                {!isDark && (
                  <CheckCircle2 size={16} className="sm:hidden text-white" />
                )}
              </button>
              <button 
                onClick={() => setIsDark(true)}
                className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${isDark ? "btn-vibrant-3d" : !isDark ? "bg-slate-100 border border-slate-200 text-slate-400" : "bg-[#1f2937] border border-white/10 text-white/40"}`}
              >
                <div className="flex items-center gap-2">
                  <Moon size={20} className={isDark ? "text-white" : "text-slate-400 group-hover:text-purple-400"} />
                  <span className="text-sm sm:text-base font-bold opacity-80 group-hover:opacity-100 transition-opacity">Tối</span>
                </div>
                {isDark && (
                  <CheckCircle2 size={16} className="sm:hidden text-white" />
                )}
              </button>
            </div>
          </div>

          {/* 2. Kiểu giao diện */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
              <Monitor size={20} className="text-blue-500" />
              <div>
                <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Giao diện điều hướng</span>
                <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn điều hướng hiển thị tốt nhất trên thiết bị của bạn</p>
              </div>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <button 
              onClick={() => setUseSidebar(true)}
              className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${useSidebar ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
            >
              <div className="flex items-center gap-2">
                <Monitor size={20} className={useSidebar ? "text-white" : "text-slate-400 group-hover:text-blue-400"} />
                <span className="text-sm sm:text-base font-bold">Desktop</span>
              </div>
              {useSidebar && <CheckCircle2 size={16} className="sm:hidden text-white" />}
            </button>
            <button 
              onClick={() => setUseSidebar(false)}
              className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${!useSidebar ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
            >
              <div className="flex items-center gap-2">
                <Navigation size={20} className={!useSidebar ? "text-white" : "text-slate-400 group-hover:text-purple-400"} />
                <span className="text-sm sm:text-base font-bold">Touch</span>
              </div>
              {!useSidebar && <CheckCircle2 size={16} className="sm:hidden text-white" />}
            </button>
          </div>
          </div>

          <AnimatePresence mode="popLayout">
            {/* 2a. Position & Display (Desktop only) */}
            {useSidebar && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-10"
              >
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
                    <Layout size={20} className="text-indigo-500" />
                    <div>
                      <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Vị trí Sidebar</span>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn vị trí đặt Sidebar thuận tiện cho bạn - trái hoặc phải</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                    <button 
                      onClick={() => setIsSidebarRight(false)}
                      className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${!isSidebarRight ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowLeft size={20} className={!isSidebarRight ? "text-white" : "text-slate-400 group-hover:text-amber-500"} />
                        <span className="text-sm sm:text-base font-bold">Bên trái</span>
                      </div>
                      {!isSidebarRight && <CheckCircle2 size={16} className="sm:hidden text-white" />}
                    </button>
                    <button 
                      onClick={() => setIsSidebarRight(true)}
                      className={`transition-all flex items-center justify-between sm:justify-center px-4 sm:px-0 gap-3 group h-12 md:h-14 rounded-xl ${isSidebarRight ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight size={20} className={isSidebarRight ? "text-white" : "text-slate-400 group-hover:text-purple-400"} />
                        <span className="text-sm font-bold">Bên phải</span>
                      </div>
                      {isSidebarRight && <CheckCircle2 size={16} className="sm:hidden text-white" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
                    <Layers size={20} className="text-cyan-500" />
                    <div>
                      <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Hiển thị Sidebar</span>
                      <p className="text-xs text-slate-500 font-bold mt-0.5">Chọn cách Sidebar hiển thị - lơ lửng hay chạm góc</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                    <button 
                      onClick={() => setSidebarDisplay("float")}
                      className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${sidebarDisplay === "float" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <Layers size={20} className={sidebarDisplay === "float" ? "text-white" : "text-slate-400 group-hover:text-indigo-400"} />
                      <span className="text-base font-bold">Lơ lửng</span>
                    </button>
                    <button 
                      onClick={() => setSidebarDisplay("attach")}
                      className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${sidebarDisplay === "attach" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                    >
                      <Square size={20} className={sidebarDisplay === "attach" ? "text-white" : "text-slate-400 group-hover:text-indigo-400"} />
                      <span className="text-base font-bold">Chạm góc</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2b. Liquid Glass */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 px-1 text-center md:text-left">
                  <Droplet size={20} className="text-cyan-500" />
                  <div>
                    <span className="text-base md:text-lg font-bold opacity-80 uppercase tracking-wider">Hiệu ứng Liquid Glass</span>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">Cá nhân hóa hiệu ứng phản xạ kính trên giao diện</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                  <button 
                    onClick={() => setLiquidGlass("glassy")}
                    className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${liquidGlass === "glassy" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                  >
                    <Droplet size={20} className={liquidGlass === "glassy" ? "text-white" : "text-slate-400 group-hover:text-cyan-500"} />
                    <span className="text-base font-bold">Glassy</span>
                  </button>
                  <button 
                    onClick={() => setLiquidGlass("tinted")}
                    className={`transition-all flex items-center justify-center gap-3 group h-12 md:h-14 rounded-xl ${liquidGlass === "tinted" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/10 text-white/40" : "bg-slate-100 border border-slate-200 text-slate-400"}`}
                  >
                    <Droplet size={20} className={liquidGlass === "tinted" ? "text-white" : "text-slate-400 group-hover:text-cyan-500"} />
                    <span className="text-base font-bold">Tinted</span>
                  </button>
                </div>
              </motion.div>
          </AnimatePresence>

          {/* Regular toggles grouped into one container with iOS-style dividers */}
          <div className={`rounded-[32px] overflow-hidden border-2 transition-all ${isDark ? "bg-white/5 border-white/10 shadow-xl" : "bg-slate-50 border-slate-200 shadow-sm"}`}>
            {/* 5. Ghim kênh (Truy cập nhanh) */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-8 transition-all hover:bg-black/5 gap-4`}>
              <div className="flex items-start md:items-center gap-4 md:gap-5">
                <div className="p-3 md:p-4 rounded-2xl bg-pink-500/10 text-pink-500 shrink-0">
                  <Pin size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base md:text-lg font-bold">Truy cập nhanh</p>
                  <p className={`text-xs md:text-sm font-bold opacity-60 leading-tight ${isDark ? "text-white" : "text-slate-500"}`}>Hiển thị các kênh thêm vào danh sách yêu thích trên Sidebar</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPinningEnabled(!isPinningEnabled)}
                className={`w-14 md:w-16 h-7 md:h-8 rounded-full transition-all relative border-2 shrink-0 self-end sm:self-center ${isPinningEnabled ? "bg-purple-600/30 border-purple-600/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: isPinningEnabled ? 28 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[2px] h-[18px] md:h-[22px] w-[26px] md:w-[30px] rounded-full shadow-sm transition-colors ${isPinningEnabled ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>

            <div className={`h-[1px] mx-5 md:mx-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

            {/* 6. Giảm chuyển động */}
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-8 transition-all hover:bg-black/5 gap-4`}>
              <div className="flex items-start md:items-center gap-4 md:gap-5">
                <div className="p-3 md:p-4 rounded-2xl bg-purple-500/10 text-purple-500 shrink-0">
                  <Zap size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base md:text-lg font-bold">Giảm chuyển động</p>
                  <p className={`text-xs md:text-sm font-bold opacity-60 leading-tight ${isDark ? "text-white" : "text-slate-500"}`}>Giảm các hiệu ứng chuyển động để tối ưu hiệu suất</p>
                </div>
              </div>
              <button 
                onClick={() => setFeatureFlags(prev => ({ ...prev, disable_animation: !prev.disable_animation }))}
                className={`w-14 md:w-16 h-7 md:h-8 rounded-full transition-all relative border-2 shrink-0 self-end sm:self-center ${featureFlags.disable_animation ? "bg-purple-600/30 border-purple-600/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: featureFlags.disable_animation ? 28 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[2px] h-[18px] md:h-[22px] w-[26px] md:w-[30px] rounded-full shadow-sm transition-colors ${featureFlags.disable_animation ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>

            <div className={`h-[1px] mx-5 md:mx-8 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />

          </div>

          {/* Experimental separated block removed - moved to Thử nghiệm tab */}
        </div>
      </div>

      {/* Weather Settings */}
      <div className={`p-6 md:p-10 rounded-[32px] border flex flex-col transition-all w-full mt-6 md:mt-8 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-500">
            <Globe size={24} className="md:w-6 md:h-6" />
          </div>
          <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Thời tiết</h3>
        </div>

        <div className="space-y-8">
          {/* Unit selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Droplet size={18} className="text-cyan-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Đơn bị nhiệt độ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={() => setTempUnit("C")} className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all ${tempUnit === "C" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/5 text-white/40" : "bg-black/5 border border-black/5 text-black/40"}`}>
                Độ C (°C)
              </button>
              <button onClick={() => setTempUnit("F")} className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all ${tempUnit === "F" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] border border-white/5 text-white/40" : "bg-black/5 border border-black/5 text-black/40"}`}>
                Độ F (°F)
              </button>
            </div>
          </div>

          {/* Location customization */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation size={18} className="text-emerald-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Vị trí tùy chỉnh</p>
            </div>
            <div className={`relative group rounded-2xl overflow-hidden transition-all ${isDark ? "bg-white/5 shadow-inner border border-white/5" : "bg-slate-100 shadow-sm border border-slate-200"}`}>
              <input 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="Nhập tên thành phố (vd: Hanoi, Saigon)..."
                className={`w-full px-6 py-4 text-base font-bold bg-transparent outline-none transition-all ${
                  isDark ? "text-white placeholder-white/20" : "text-slate-900 placeholder-slate-400"
                }`} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Clock & Formatting Settings */}
      <div className={`p-6 md:p-10 rounded-[32px] border flex flex-col transition-all w-full mt-6 md:mt-8 ${isDark ? "bg-black/40 border-white/10 shadow-inner" : "bg-slate-50 border-slate-100 shadow-sm"}`}>
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-amber-500/10 text-amber-500">
            <Clock size={24} className="md:w-6 md:h-6" />
          </div>
          <h3 className={`font-bold text-xl md:text-2xl tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Đồng hồ & Thời gian</h3>
        </div>

        <div className="space-y-8">
          {/* 1. Time Format 24h vs 12h */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-purple-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Chế độ hiển thị</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button 
                onClick={() => setTimeFormat("24h")}
                className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 ${timeFormat === "24h" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40 border border-white/5" : "bg-black/5 text-slate-400 border border-black/5"}`}
              >
                24 Giờ
              </button>
              <button 
                onClick={() => setTimeFormat("12h")}
                className={`h-10 md:h-12 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-3 ${timeFormat === "12h" ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40 border border-white/5" : "bg-black/5 text-slate-400 border border-black/5"}`}
              >
                12 Giờ
              </button>
            </div>
          </div>

          {/* 2. Clock Format selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sliders size={18} className="text-blue-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Định dạng hiển thị Giờ</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { id: "hh:mm:ss", label: "hh:mm:ss" },
                { id: "hh:mm", label: "hh:mm" },
                { id: "custom", label: "Tùy chỉnh" }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setClockFormat(opt.id as any)}
                  className={`h-9 md:h-11 rounded-lg font-bold text-xs transition-all ${clockFormat === opt.id ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40" : "bg-black/5 text-slate-500"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Date Format selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-red-500" />
              <p className="font-bold text-base opacity-80 uppercase tracking-widest leading-none">Định dạng hiển thị Ngày</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { id: "dd/mm/yyyy", label: "dd/mm/yyyy" },
                { id: "dd/mm/yy", label: "dd/mm/yy" },
                { id: "dd/mm", label: "dd/mm" },
                { id: "custom", label: "Tùy chỉnh" }
              ].map(opt => (
                <button 
                  key={opt.id}
                  onClick={() => setDateFormat(opt.id as any)}
                  className={`h-9 md:h-11 rounded-lg font-bold text-[9px] transition-all px-1.5 ${dateFormat === opt.id ? "btn-vibrant-3d" : isDark ? "bg-[#1f2937] text-white/40" : "bg-black/5 text-slate-500"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Show temp in clock toggle */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 md:p-8 transition-all hover:bg-black/5 gap-4 rounded-[40px] border-2 mt-4 ${isDark ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200 shadow-sm"}`}>
              <div className="flex items-start md:items-center gap-4">
                <div className="p-3 md:p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 shrink-0">
                  <Sun size={24} className="md:w-7 md:h-7" />
                </div>
                <div className="text-left space-y-1">
                  <p className="text-base md:text-lg font-bold">Hiển thị nhiệt độ</p>
                  <p className={`text-xs md:text-sm font-bold opacity-60 leading-tight ${isDark ? "text-white" : "text-slate-500"}`}>Hiển thị nhiệt độ cạnh đồng hồ và ngày tháng tại sidebar</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTempInClock(!showTempInClock)}
                className={`w-14 md:w-16 h-7 md:h-8 rounded-full transition-all relative border-2 shrink-0 self-end sm:self-center ${showTempInClock ? "bg-cyan-600/30 border-cyan-600/40" : "bg-transparent border-slate-700/30"}`}
              >
                <motion.div 
                  animate={{ 
                    x: showTempInClock ? 28 : 4,
                  }}
                  initial={false}
                  transition={{ type: "spring", damping: 20, stiffness: 200 }}
                  className={`absolute top-[2px] h-[18px] md:h-[22px] w-[26px] md:w-[30px] rounded-full shadow-sm transition-colors ${showTempInClock ? "bg-white" : "bg-white"}`}
                />
              </button>
            </div>
        </div>
      </div>

<div className="pt-12 text-center pb-24" />
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
    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 ${isOpen ? "visible" : "invisible"}`}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              layoutId="auth-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className={`relative w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col md:flex-row min-h-[400px] md:min-h-[580px] rounded-[40px] md:rounded-[56px] bg-white/95 backdrop-blur-[100px] border border-white/40`}
            >
              {/* Image/Visual Side - Responsive hiding for very small screens if necessary, or just smaller height */}
              <div className="w-full md:w-[45%] h-48 md:h-auto bg-gradient-to-br from-purple-600 to-indigo-900 p-6 md:p-12 relative flex flex-col justify-between overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 blur-[100px] -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 blur-[100px] -ml-32 -mb-32" />
                
                <div className="relative z-10 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/20 shadow-xl">
                    <img 
                      src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi"
                      className="w-8 h-8 md:w-10 md:h-10 object-contain"
                      alt="Vplay"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1 md:space-y-2">
                    <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tighter leading-none">
                      {isLogin ? "Chào mừng trở lại!" : "Tham gia mạng lưới Vplay"}
                    </h2>
                    <p className="text-white/60 text-xs md:text-base font-medium leading-relaxed max-w-xs">
                      {isLogin ? "Trải nghiệm thế giới giải trí 4K không giới hạn ngay trong tầm tay bạn." : "Đăng ký tài khoản để đồng bộ hóa và nhận đề xuất cá nhân hóa từ AI."}
                    </p>
                  </div>
                </div>

                <div className="relative z-10 hidden md:block">
                   <div className={`p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl space-y-4`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                           <Sparkles size={20} />
                        </div>
                        <h4 className="text-white font-bold text-sm">Thông báo tài khoản Vplay Beta</h4>
                      </div>
                      <p className="text-white/70 text-xs leading-relaxed font-medium">
                        Vplay Beta không hỗ trợ hệ thống đăng nhập, chỉ có ở phiên bản chính thức. Bạn sẽ được phát cho một tài khoản xem truyền hình miễn phí:
                      </p>
                      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-white/5 border border-white/10">
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase">Tên đăng nhập</span>
                          <span className="text-sm text-amber-400 font-bold">vplaybeta</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] text-white/40 font-bold uppercase">Mật khẩu</span>
                          <span className="text-sm text-amber-400 font-bold">vplaybeta</span>
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="flex-1 p-6 sm:p-8 md:p-14 overflow-y-auto scrollbar-hide">
                <div className="max-w-md mx-auto space-y-8 md:space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        {isForgotPassword ? "Quên mật khẩu" : (isLogin ? "Đăng nhập" : "Đăng ký")}
                      </h3>
                      <p className="text-slate-500 text-[11px] md:text-sm font-medium mt-1">Vui lòng điền thông tin bên dưới</p>
                    </div>
                    <button onClick={onClose} className={`p-2.5 md:p-3 rounded-full transition-colors ${isDark ? "bg-white/5 text-white hover:bg-white/10" : "bg-slate-100 text-slate-900 hover:bg-slate-200"}`}>
                       <X size={18} className="md:w-5 md:h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <button 
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className={`w-full h-14 md:h-16 flex items-center justify-center gap-4 text-xs md:text-sm font-bold transition-all shadow-lg active:scale-[0.98] ${
                        isDark 
                          ? "bg-[#111111] border border-white/5 text-white shadow-black/40" 
                          : "bg-white border border-slate-200 text-slate-900 shadow-slate-200/50"
                      } rounded-2xl`}
                    >
                      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/icon_google.svg" className="w-5 h-5 md:w-6 md:h-6" alt="Google" />
                      Tiếp tục với Google
                    </button>

                    <div className="flex items-center gap-4">
                      <div className={`flex-1 h-[1px] ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                      <span className="text-[9px] font-bold uppercase opacity-30 tracking-[0.2em]">Hoặc với tên đăng nhập</span>
                      <div className={`flex-1 h-[1px] ${isDark ? "bg-white/5" : "bg-slate-100"}`} />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      {error && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[11px] font-bold text-center uppercase tracking-wider">
                          {error}
                        </motion.div>
                      )}
                      {success && (
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl text-[11px] font-bold text-center uppercase tracking-wider">
                          {success}
                        </motion.div>
                      )}
                      
                      <div className="space-y-2">
                        <label className={labelClasses}>Tên đăng nhập / Email</label>
                        <div className={inputContainerClasses}>
                          <input 
                            required 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            className={inputClasses} 
                            placeholder="Nhập tài khoản vplay..." 
                          />
                        </div>
                      </div>

                      {!isForgotPassword && (
                        <div className="space-y-2">
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
                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-500 transition-colors"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      )}

                      {!isForgotPassword && !isLogin && (
                        <div className="space-y-2">
                          <label className={labelClasses}>Xác nhận mật khẩu</label>
                          <div className={inputContainerClasses}>
                            <input 
                              required 
                              type={showPassword ? "text" : "password"} 
                              value={confirmPassword} 
                              onChange={e => setConfirmPassword(e.target.value)} 
                              className={inputClasses} 
                              placeholder="Lặp lại mật khẩu..." 
                            />
                          </div>
                        </div>
                      )}

                      {isLogin && !isForgotPassword && (
                        <div className="text-right">
                          <button type="button" onClick={() => setIsForgotPassword(true)} className="text-[11px] font-bold text-purple-500 hover:opacity-70 transition-opacity">
                            Quên mật khẩu?
                          </button>
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="btn-purple-3d w-full h-14 md:h-16 text-base md:text-lg font-bold tracking-widest disabled:opacity-50 mt-4 rounded-2xl md:rounded-3xl flex items-center justify-center gap-3"
                      >
                        {loading && <LoadingSpinner isDark={true} className="w-6 h-6 border-white" />}
                        {loading ? "ĐANG XỬ LÝ..." : (isForgotPassword ? "GỬI YÊU CẦU" : (isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"))}
                      </button>
                    </form>

                    <div className="text-center">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsLogin(!isLogin);
                          setIsForgotPassword(false);
                          setError("");
                        }} 
                        className={`text-xs font-bold tracking-wide transition-colors ${isDark ? "text-white/40 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
                      >
                        {isForgotPassword ? "Quay lại trang Đăng nhập" : (isLogin ? "Chưa có tài khoản? Tham gia ngay" : "Đã có thành viên? Đăng nhập ngay")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


function WhatsNewPopup({ isDark, onClose, liquidGlass }: { isDark: boolean, onClose: () => void, liquidGlass: "glassy" | "tinted" }) {
  const categories = [
    {
      title: "🎨 USER INTERFACE",
      items: [
        "Update lại toàn bộ design system cho các nút và toggles theo phong cách nổi",
        "Update lại popup \"Đăng nhập/Đăng ký\"",
        "Update lại layout bố trí cho Settings",
        "Thêm đồng hồ và lịch trên sidebar và navigation pane",
        "Transition animation mới giữa các trang"
      ]
    },
    {
      title: "✨ SIDEBAR",
      items: [
        "Tái cấu trúc lại toàn bộ behaviour của sidebar",
        "Hiển thị 4 items/page với mũi tên chuyển trang",
        "Chế độ \"Idle mode\" hiển thị đồng hồ và lịch sau 5 giây"
      ]
    },
    {
      title: "🔍 KHÁM PHÁ",
      items: [
        "Tab \"Khám phá\" mới cho tìm kiếm và đề xuất",
        "Tích hợp tìm kiếm sâu cho cả kênh và cài đặt hệ thống"
      ]
    },
    {
      title: "🧪 THỬ NGHIỆM",
      items: [
        "Tab Experimental Labs riêng biệt",
        "Thử nghiệm: Multiview, Picture-in-Picture và Screen Recording"
      ]
    },
    {
      title: "🐛 BUG FIXES",
      items: [
        "Kênh VTV1 và VTV9 hiện đã có thể xem được bình thường",
        "Tối ưu hóa một số trang khi hiển thị trên thiết bị di động"
      ]
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center p-2 sm:p-4 md:p-8 backdrop-blur-2xl bg-black/60"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className={`relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-[40px] md:rounded-[56px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col transition-colors border ${
          isDark 
            ? "bg-[#130f26]/95 border-white/20" 
            : "bg-white/95 border-white/40"
        } backdrop-blur-[100px]`}
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />
        
        <div className="p-6 md:p-12 flex flex-col flex-1 overflow-hidden space-y-6 md:space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className={`text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                What's new <span className="text-purple-500 block sm:inline">in Vplay Dev</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-purple-500/10 text-purple-500 text-[9px] md:text-[10px] font-bold tracking-widest uppercase border border-purple-500/20">Build 26604</span>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Stable Beta</span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`p-3 md:p-4 rounded-2xl md:rounded-3xl transition-all shrink-0 ${isDark ? "bg-white/5 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 text-slate-900"}`}
            >
              <X size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 overflow-y-auto pr-2 scrollbar-hide flex-1">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-3 md:space-y-4"
              >
                <h3 className="text-[11px] md:text-sm font-bold text-purple-500 tracking-[0.2em]">{cat.title}</h3>
                <ul className="space-y-2 md:space-y-3">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 md:gap-3">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-500/40 shrink-0" />
                      <p className={`text-xs md:text-sm font-medium leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>{item}</p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 shrink-0 mt-auto">
            <div className="flex items-center gap-3 md:gap-4 self-start md:self-center">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${isDark ? "bg-white/5 border-white/10" : "bg-slate-100 border-slate-200"} border shadow-sm`}>
                <Sparkles size={18} className="text-amber-500 md:w-5 md:h-5" />
              </div>
              <div>
                <p className={`text-[9px] md:text-xs font-bold leading-none ${isDark ? "text-white/60" : "text-slate-500"}`}>TRẢI NGHIỆM ĐƯỢC CÁ NHÂN HÓA</p>
                <p className={`text-xs md:text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Khám phá ngay phiên bản mới nhất</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-full md:w-auto btn-vibrant-3d px-8 md:px-12 py-4 md:py-6 text-sm md:text-lg font-bold tracking-widest !rounded-2xl md:!rounded-3xl"
            >
              KHÁM PHÁ NGAY
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const placeholderColor = isGlassy ? "placeholder-white/40" : "placeholder-black/40";
  const textColor = isGlassy ? "text-white" : "text-black";

  return (
    <div className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-1.5 h-10 md:h-12 w-full max-w-2xl relative group rounded-2xl overflow-hidden transition-all ${isGlassy ? "bg-white/10" : isDark ? "bg-slate-800/60" : "bg-slate-200"}`}>
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        <SearchIcon className={`h-4 w-4 md:h-5 md:w-5 ${iconColor} flex-shrink-0 transition-colors ${isDark ? "group-focus-within:text-purple-400" : "group-focus-within:text-purple-500"}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`flex-1 bg-transparent border-none outline-none text-sm font-bold truncate ${textColor} ${placeholderColor}`}
        />
      </div>
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[90%] transition-all duration-300 ${isGlassy ? "bg-white/20" : "bg-black/5"} group-focus-within:bg-purple-500/60 group-focus-within:shadow-[0_0_10px_rgba(168,85,247,0.3)]`} />
      <div className="flex items-center gap-2 shrink-0">
        <button 
          onClick={startVoiceSearch}
          className={`p-1.5 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : `${iconColor} opacity-40 hover:opacity-100`}`}
          title="Đang nghe..."
        >
          <MicIcon size={20} className="md:w-5 md:h-5" />
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
    featureFlags: { multiview_channels: false, disable_animation: false }
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
      icon: AccountIcon,
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
      className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-8"
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
                          <div className="p-3.5 rounded-2xl bg-white text-purple-600"><SignInIcon size={24} /></div>
                          <div className="text-left">
                            <h4 className="text-base font-bold">Đăng nhập tài khoản</h4>
                            <p className="text-xs opacity-70">Sử dụng tài khoản Vplay của bạn</p>
                          </div>
                        </button>
                        <button
                          onClick={nextStep}
                          className={`flex items-center gap-5 p-6 rounded-3xl border-2 transition-all ${config.isDark ? "bg-white/5 border-white/10 hover:bg-white/10 text-white" : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900"}`}
                        >
                          <div className={`p-3.5 rounded-2xl ${config.isDark ? "bg-white/10" : "bg-white"} text-slate-50`}><AccountIcon size={24} /></div>
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

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex gap-2">
                    {steps.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? "w-8 bg-purple-500" : "w-1.5 bg-white/20"}`} />
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {step > 0 && step < 5 && (
                      <button onClick={prevStep} className={`px-6 py-2.5 rounded-2xl font-bold text-sm transition-all ${config.isDark ? "text-white hover:bg-white/5" : "text-slate-600 hover:bg-black/5"}`}>Quay lại</button>
                    )}
                    {step < 5 ? (
                      <button onClick={nextStep} className="px-8 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-500/20 transition-all active:scale-95">Tiếp theo</button>
                    ) : (
                      <button onClick={() => onComplete(config)} className="px-10 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-[24px] font-bold text-sm shadow-xl shadow-purple-500/30 transition-all active:scale-95 hover:shadow-2xl">Bắt đầu ngay</button>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Skip button for dev */}
      <div className="fixed bottom-6 right-6 opacity-0 hover:opacity-100 transition-all group z-[2001]">
         <form onSubmit={handleSkip} className="flex items-center gap-2">
           <input 
             type="password" 
             value={skipPass}
             onChange={(e) => setSkipPass(e.target.value)}
             placeholder="Bypass..." 
             className={`w-24 px-3 py-1 text-[10px] rounded-full border bg-black/40 text-white outline-none transition-all ${skipError ? "border-red-500" : "border-white/10 focus:border-purple-500"}`}
           />
         </form>
      </div>
    </motion.div>
  );
}

function TopBar({ 
  isDark, 
  onMenuClick, 
  searchQuery, 
  setSearchQuery, 
  onSearchClick, 
  isSearchOpen, 
  currentTime, 
  weather, 
  showTempInClock, 
  getTempDisplay, 
  formatTime,
  formatDateString,
  user, 
  onLogin, 
  onLogout,
  setActiveTab,
  profileStates,
  sidebarExpanded,
  useSidebar
}: { 
  isDark: boolean, 
  onMenuClick: () => void, 
  searchQuery: string, 
  setSearchQuery: (q: string) => void, 
  onSearchClick: () => void, 
  isSearchOpen: boolean, 
  currentTime: Date, 
  weather: any, 
  showTempInClock: boolean, 
  getTempDisplay: () => string, 
  formatTime: (date: Date) => string,
  formatDateString: (date: Date) => string,
  user: any, 
  onLogin: () => void, 
  onLogout: () => void,
  setActiveTab: (tab: string) => void,
  profileStates: {
    name: string;
    setName: (val: string) => void;
    avatar: string;
    setAvatar: (val: string) => void;
    saving: boolean;
    handleSave: () => Promise<void>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
  },
  sidebarExpanded?: boolean,
  useSidebar?: boolean
}) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [menuView, setMenuView] = useState<"main" | "profile" | "version" | "feedback">("main");
  const hours = currentTime.getHours();
  const isDaytime = hours >= 5 && hours < 18;
  const WeatherIcon = isDaytime ? Sun : Moon;
  const weatherColor = isDaytime ? "text-yellow-400" : "text-blue-400";
  const dateStr = formatDateString(currentTime);

  // Calculate dynamic left offset for content to avoid sidebar overlap
  // Only offset if we are on desktop and sidebar is on the left
  return (
    <div className={`h-14 flex items-center justify-between px-4 sticky top-0 z-[130] transition-all duration-300 ${
      isDark ? "bg-[#0a0118]" : "bg-[#f2f2f7]"
    }`}
    >
      <div className="flex items-center gap-2">
        <button 
          onClick={onMenuClick}
          className={`p-2 rounded-xl transition-all hover:bg-white/5 ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 ml-1">
          <motion.img 
            src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
            alt="Logo" 
            className="w-6 h-6 object-contain"
            referrerPolicy="no-referrer"
          />
          <span className="font-bold text-sm tracking-tight hidden xs:block">Vplay</span>
        </div>
      </div>

      <div className="flex-1 flex justify-center mx-4 relative max-w-sm md:max-w-md lg:max-w-lg">
        <div 
          className={`group flex items-center gap-2.5 h-10 w-full transition-all relative border-b rounded-md transition-all duration-300 ${
            isDark 
              ? "bg-[#250325] border-white/30 focus-within:bg-[#350235] focus-within:border-fuchsia-400/40 text-white/90" 
              : "bg-white border-slate-200 focus-within:border-fuchsia-500 text-slate-800"
          }`}
        >
          <Search size={18} className={`ml-3 ${isDark ? "text-white/50 group-focus-within:text-fuchsia-400" : "text-slate-400"}`} />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setActiveTab("Khám phá")}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find and explore on Vplay"
            className={`flex-1 bg-transparent border-none outline-none text-sm font-medium font-display ${isDark ? "placeholder:text-white/20" : "placeholder:text-slate-400"}`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="p-1 hover:bg-white/10 rounded-full transition-all">
              <X size={14} className={isDark ? "text-white/40" : "text-slate-400"} />
            </button>
          )}
          <button className={`p-2 rounded-full transition-all mr-4 ${isDark ? "text-white/50 hover:text-white hover:bg-white/10" : "text-slate-400 hover:text-slate-900 hover:bg-black/5"}`}>
            <Mic size={18} />
          </button>
        </div>

        {/* Quick Search Preview */}
        <AnimatePresence>
          {searchQuery.trim().length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 w-full max-w-lg rounded-2xl shadow-2xl border p-2 z-[200] ${
                isDark ? "bg-[#0a0118] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="max-h-80 overflow-y-auto px-1 space-y-1 custom-scrollbar">
                {channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5).map(c => (
                  <button
                    key={`search-preview-${c.name}`}
                    onClick={() => {
                      setActiveTab("Phát sóng");
                      // setActiveChannel logic should be handled by App state
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all ${isDark ? "hover:bg-white/5" : "hover:bg-slate-100"}`}
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/5 p-1.5 flex items-center justify-center border border-white/5">
                      <img src={c.logo} alt={c.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-bold truncate uppercase tracking-tight">{c.name}</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest">{c.category}</p>
                    </div>
                    <ArrowRight size={14} className="opacity-20" />
                  </button>
                ))}
                {channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="py-8 text-center text-xs opacity-40 uppercase tracking-widest font-bold">
                    Không tìm thấy kênh nào
                  </div>
                )}
              </div>
              <button 
                onClick={() => setActiveTab("Khám phá")}
                className="w-full py-3 mt-1 text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 hover:text-purple-400 transition-all border-t border-white/5"
              >
                Xem tất cả kết quả
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end text-right leading-none mr-3 font-display">
          <div className={`text-sm font-bold tracking-tight mb-0.5 ${isDark ? "text-white/90" : "text-slate-900"}`}>
            {formatTime(currentTime)}
          </div>
          <div className={`text-[10px] font-bold tracking-widest uppercase opacity-40 ${isDark ? "text-white" : "text-slate-600"}`}>
            {dateStr}
          </div>
        </div>

        {/* User Account Menu moved to the right */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`group flex items-center justify-center w-8 h-8 rounded-full transition-all border-2 border-white/5 ${
              user 
                ? (isDark ? "bg-white/[0.08] text-white hover:bg-white/[0.12] hover:border-purple-500/30" : "bg-black/[0.05] text-black hover:bg-black/[0.08]")
                : "bg-amber-400/10 text-amber-500 hover:bg-amber-400/20 shadow-sm shadow-amber-400/10"
            }`}
          >
            {user && user.photoURL ? (
              <img src={user.photoURL} className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={16} className={!user ? "text-amber-500" : ""} />
            )}
          </button>

          <AnimatePresence>
            {isUserMenuOpen && (
              <>
                <div className="fixed inset-0 z-[150]" onClick={() => { setIsUserMenuOpen(false); setMenuView("main"); }} />
                <motion.div
                  initial={{ opacity: 0, y: -40, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -40, scale: 0.95 }}
                  transition={{ type: "spring", damping: 25, stiffness: 400 }}
                  className={`absolute top-full right-0 mt-3 w-80 rounded-2xl shadow-2xl z-[155] overflow-hidden border ${
                    isDark ? "bg-[#0a0118] border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {menuView === "main" && (
                      <motion.div 
                        key="menu-main"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        {user ? (
                          <div className="p-5 flex items-start gap-4 border-b border-white/5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden">
                              {profileStates.avatar ? (
                                <img src={profileStates.avatar} className="w-full h-full object-cover" />
                              ) : (
                                <span>{user.displayName ? user.displayName.slice(0, 2).toUpperCase() : (user.email ? user.email.slice(0, 2).toUpperCase() : "US")}</span>
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="font-bold truncate text-sm">{profileStates.name || "Luke Cooper"}</p>
                              <p className="text-[10px] opacity-40 truncate">{user.email || "sonhuyc2kl@gmail.com"}</p>
                              <button 
                                onClick={() => { onLogout(); setIsUserMenuOpen(false); }}
                                className="mt-1.5 text-[10px] text-fuchsia-400 hover:underline font-bold tracking-widest"
                              >
                                Đăng xuất
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-5 flex flex-col items-center text-center gap-3 border-b border-white/5">
                            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-white/40">
                              <User size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">Khách</p>
                              <p className="text-[10px] opacity-40 leading-tight">Đăng nhập để có trải nghiệm tốt nhất</p>
                            </div>
                            <button 
                              onClick={() => { onLogin(); setIsUserMenuOpen(false); }}
                              className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-xl text-[10px] font-bold transition-all shadow-lg shadow-fuchsia-600/20"
                            >
                              Đăng nhập ngay
                            </button>
                          </div>
                        )}

                        <div className="p-2">
                          {[
                            { icon: Info, label: "Phiên bản Vplay", action: () => setMenuView("version") },
                            { icon: Smartphone, label: "Quản lý hồ sơ", action: () => setMenuView("profile") },
                            { icon: Pizza, label: "Thử nghiệm Vplay", action: () => { setActiveTab("Experimental"); setIsUserMenuOpen(false); } },
                            { icon: SettingsIcon, label: "Cài đặt hệ thống", action: () => { setActiveTab("Cài đặt"); setIsUserMenuOpen(false); } },
                            { icon: Send, label: "Send Feedback", action: () => setMenuView("feedback") },
                          ].map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                if (item.action) item.action();
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                                isDark ? "hover:bg-white/5" : "hover:bg-black/5"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`transition-colors ${isDark ? "text-white/50 group-hover:text-fuchsia-400" : "text-black/50"}`}>
                                  <item.icon size={22} strokeWidth={1.5} />
                                </div>
                                <span className="text-xs font-bold tracking-tight opacity-70 group-hover:opacity-100">{item.label}</span>
                              </div>
                              <ChevronRight size={12} className="opacity-20 group-hover:opacity-60 transition-all" />
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {menuView === "profile" && (
                      <motion.div 
                        key="menu-profile"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="p-5"
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <button onClick={() => setMenuView("main")} className="p-1 hover:bg-white/5 rounded-lg transition-all">
                            <ChevronLeft size={20} />
                          </button>
                          <span className="font-bold">Quản lý hồ sơ</span>
                        </div>

                        {!user ? (
                           <div className="py-4 text-center space-y-4">
                             <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 flex items-center justify-center text-white/20">
                               <User size={32} />
                             </div>
                             <p className="text-sm opacity-60">Vui lòng đăng nhập để chỉnh sửa hồ sơ</p>
                             <button onClick={() => onLogin()} className="w-full py-2 bg-purple-600 rounded-lg text-sm font-bold">Đăng nhập</button>
                           </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex flex-col items-center gap-3">
                              <div className="relative group cursor-pointer" onClick={() => profileStates.fileInputRef.current?.click()}>
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10">
                                  {profileStates.avatar ? (
                                    <img src={profileStates.avatar} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                                      <User size={32} />
                                    </div>
                                  )}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                  <Camera size={18} className="text-white" />
                                </div>
                                <input type="file" accept="image/*" ref={profileStates.fileInputRef} onChange={profileStates.handleFileChange} className="hidden" />
                              </div>
                              <div className="w-full space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-2">Tên hiển thị</label>
                                <input 
                                  value={profileStates.name}
                                  onChange={e => profileStates.setName(e.target.value)}
                                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-purple-500/50"
                                />
                              </div>
                              <button 
                                onClick={profileStates.handleSave}
                                disabled={profileStates.saving}
                                className="w-full py-2.5 bg-purple-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20"
                              >
                                {profileStates.saving ? "Đang lưu..." : "Lưu thay đổi"}
                              </button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {menuView === "version" && (
                      <motion.div 
                        key="menu-version"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="p-5"
                      >
                        <div className="flex items-center gap-2 mb-6">
                          <button onClick={() => setMenuView("main")} className="p-1 hover:bg-white/5 rounded-lg transition-all">
                            <ChevronLeft size={20} />
                          </button>
                          <span className="font-bold">Thông tin phiên bản</span>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Trạng thái</p>
                            <p className="text-xl font-bold text-emerald-400">Ổn định</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Build Number</p>
                            <p className="text-xl font-bold">Build 26604</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Cập nhật lần cuối</p>
                            <p className="text-sm font-bold">14/05/2026</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {menuView === "feedback" && (
                      <motion.div 
                        key="menu-feedback"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="p-5"
                      >
                        <div className="flex items-center gap-2 mb-6">
                          <button onClick={() => setMenuView("main")} className="p-1 hover:bg-white/5 rounded-lg transition-all">
                            <ChevronLeft size={20} />
                          </button>
                          <span className="font-bold">Gửi phản hồi</span>
                        </div>

                        <div className="space-y-3">
                          <p className="text-[11px] font-medium opacity-60 mb-2">Tham gia cộng đồng để đóng góp ý kiến cho chúng tôi:</p>
                          <a 
                            href="https://discord.gg/CNKFTUBSty" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 hover:bg-[#5865F2]/20 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-lg bg-[#5865F2] flex items-center justify-center text-white">
                              <MessageSquare size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold">THE WAVES (Discord)</p>
                              <p className="text-[10px] opacity-60">Tham gia ngay</p>
                            </div>
                          </a>
                          <div className="grid grid-cols-1 gap-2">
                            {[1, 2].map(num => (
                              <a 
                                key={`yt-${num}`}
                                href={`https://www.youtube.com/@ota${num === 1 ? 'one' : 'two'}fr253`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                              >
                                <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white">
                                  <Play size={16} fill="currentColor" />
                                </div>
                                <span className="text-[11px] font-bold uppercase tracking-widest opacity-80">YouTube OTA #{num}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function App() {
  const isResizing = useRef(false);
  const [showSplash, setShowSplash] = useState(false);
  const [splashDuration, setSplashDuration] = useState(5000);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return localStorage.getItem("vplay_onboarding_completed") !== "true";
  });
  const [activeTab, setActiveTab] = useState("Trang chủ");
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "Cài đặt") {
      setIsSettingsLoading(true);
      const timer = setTimeout(() => {
        setIsSettingsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.displayName || "Vplay User");
      setAvatar(user.photoURL || "");
    } else {
      setName("Khách");
      setAvatar("");
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      const updateData = {
        displayName: name,
        photoURL: avatar,
        updatedAt: serverTimestamp()
      };
      await updateDoc(userRef, updateData);
      // Update local storage or user object if needed
      // Note: Firebase auth user object is usually updated via updateProfile
      await updateProfile(user, { displayName: name, photoURL: avatar });
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

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
  const [sidebarDisplay, setSidebarDisplay] = useState<"float" | "attach">(() => {
    const saved = localStorage.getItem("vplay_sidebar_display");
    return (saved as "float" | "attach") || "float";
  });
  const [isBroadcastingLocked, setIsBroadcastingLocked] = useState(true);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);

  const sidebarWidthDefault = 300;
const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem("vplay_sidebar_width");
    const baseWidth = saved ? parseInt(saved, 10) : sidebarWidthDefault;
    const isHeading = localStorage.getItem("vplay_heading_bar") === "true";
    return isHeading && baseWidth > 180 ? 180 : baseWidth;
  });

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_locked", isSidebarLocked.toString());
    if (isSidebarLocked) {
      setSidebarWidth(sidebarWidthDefault);
      localStorage.setItem("vplay_sidebar_width", sidebarWidthDefault.toString());
    }
  }, [isSidebarLocked]);

  useEffect(() => {
    localStorage.setItem("vplay_sidebar_display", sidebarDisplay);
  }, [sidebarDisplay]);

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
    return localStorage.getItem("vplay_loading_treatment") || "treatment3";
  });

  useEffect(() => {
    localStorage.setItem("vplay_loading_treatment", loadingTreatment);
  }, [loadingTreatment]);

  const [featureFlags, setFeatureFlags] = useState<{ [key: string]: boolean }>(() => {
    const saved = localStorage.getItem("vplay_feature_flags");
    return saved ? JSON.parse(saved) : { multiview_channels: false, disable_animation: false, screen_recording: false };
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
    if (activeTab !== "Cài đặt" && activeTab !== "Khám phá") {
      setPrevTab(activeTab);
    }
  }, [activeTab]);
  const [isDark, setIsDark] = useState(true); // Default to dark for better gradient look
  const [currentTime, setCurrentTime] = useState(new Date());
const [headingBar, setHeadingBar] = useState(() => {
    return localStorage.getItem("vplay_heading_bar") === "true";
  });
  useEffect(() => {
    const handleResize = () => {
      const isMobileSize = window.innerWidth < 768;
      const isLargeSize = window.innerWidth >= 1024;
      
      if (isMobileSize) {
        // If user explicitly chose sidebar (desktop mode) on mobile, show top bar
        if (useSidebar) {
          setHeadingBar(true);
        } else {
          setHeadingBar(false);
        }
      } else if (isLargeSize) {
        setHeadingBar(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, [useSidebar]);
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    if (timeFormat === "12h") {
      hours = hours % 12;
      hours = hours ? hours : 12;
    }
    
    const hStr = hours.toString().padStart(2, '0');
    
    if (clockFormat === "hh:mm") return `${hStr}:${minutes}${timeFormat === "12h" ? " " + ampm : ""}`;
    return `${hStr}:${minutes}:${seconds}${timeFormat === "12h" ? " " + ampm : ""}`;
  };

  const formatDateString = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const yy = yyyy.toString().slice(-2);
    
    if (dateFormat === "dd/mm/yy") return `${d}/${m}/${yy}`;
    if (dateFormat === "dd/mm") return `${d}/${m}`;
    return `${d}/${m}/${yyyy}`;
  };

  const getTempDisplay = () => {
    if (!weather) return "--°";
    const t = tempUnit === "F" ? (weather.temp * 9/5) + 32 : weather.temp;
    return `${Math.round(t)}°${tempUnit}`;
  };
  const [tempUnit, setTempUnit] = useState<"C" | "F">(() => (localStorage.getItem("vplay_temp_unit") as "C" | "F") || "C");
  const [location, setLocation] = useState(() => localStorage.getItem("vplay_location") || "Hanoi");
  const [weather, setWeather] = useState<{ temp: number, status: string } | null>(null);
  const [timeFormat, setTimeFormat] = useState<"24h" | "12h">(() => (localStorage.getItem("vplay_time_format") as "24h" | "12h") || "24h");
  const [clockFormat, setClockFormat] = useState<"hh:mm:ss" | "hh:mm" | "custom">(() => (localStorage.getItem("vplay_clock_format") as any) || "hh:mm:ss");
  const [dateFormat, setDateFormat] = useState<"dd/mm/yyyy" | "dd/mm/yy" | "dd/mm" | "custom">(() => (localStorage.getItem("vplay_date_format") as any) || "dd/mm/yyyy");
  const [showTempInClock, setShowTempInClock] = useState(() => localStorage.getItem("vplay_show_temp") === "true");

  useEffect(() => {
    localStorage.setItem("vplay_temp_unit", tempUnit);
    localStorage.setItem("vplay_location", location);
    localStorage.setItem("vplay_time_format", timeFormat);
    localStorage.setItem("vplay_clock_format", clockFormat);
    localStorage.setItem("vplay_date_format", dateFormat);
    localStorage.setItem("vplay_show_temp", showTempInClock.toString());
  }, [tempUnit, location, timeFormat, clockFormat, dateFormat, showTempInClock]);

  const updateWeather = useCallback(async () => {
    try {
      // Mocking weather based on location or using a simple geocode + open-meteo
      // For this demo, we'll fetch for Hanoi if location is Hanoi, or random-ish for others
      const lat = location.toLowerCase().includes("hanoi") ? 21.0285 : 10.8231; // Hanoi or Saigon
      const lon = location.toLowerCase().includes("hanoi") ? 105.8542 : 106.6297;
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
      const data = await res.json();
      if (data.current_weather) {
        setWeather({
          temp: data.current_weather.temperature,
          status: "Sunny" // Simple mock status
        });
      }
    } catch (e) {
      console.error("Failed to fetch weather", e);
    }
  }, [location]);

  useEffect(() => {
    updateWeather();
    const timer = setInterval(updateWeather, 600000); // 10 mins
    return () => clearInterval(timer);
  }, [updateWeather]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isSidebarSearchOpen, setIsSidebarSearchOpen] = useState(false);
  const [navPage, setNavPage] = useState<number>(() => {
    return Number(localStorage.getItem("vplay_nav_page")) || 2;
  });
  const navTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetNavTimer = useCallback(() => {
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      setNavPage(2);
    }, 10000);
  }, []);

  useEffect(() => {
    localStorage.setItem("vplay_nav_page", navPage.toString());
    if (navPage !== 2) {
      resetNavTimer();
    }
  }, [navPage, resetNavTimer, activeTab]);

  useEffect(() => {
    const handleGlobalClick = () => {
      if (navPage !== 2) resetNavTimer();
    };
    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick);
    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, [navPage, resetNavTimer]);

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
    if (searchQuery.toLowerCase() === "/force launch loading") {
      setShowSplash(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
    if (searchQuery.toLowerCase() === "/force launch oobe") {
      setShowOnboarding(true);
      setSearchQuery("");
      setIsSearchOpen(false);
    }
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
    if (ch.name.includes("VTV6")) {
      setIsVTV6DialogOpen(true);
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
      setUserData(null);
      setIsAdmin(false);
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
    if (t.id === "Khám phá" && headingBar) return false;
    return true;
  });

  const displayTab = activeTab;

  const handleEnterApp = useCallback(() => {
    setShowSplash(false);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContext.resume();
  }, []);

  const [isVTV6DialogOpen, setIsVTV6DialogOpen] = useState(false);

  useEffect(() => {
    const handleWhatsNew = async () => {
      const lastVersion = localStorage.getItem("vplay_version");
      const currentVersion = "26604";
      
      if (lastVersion !== currentVersion) {
        if (currentVersion !== "26604" && currentVersion !== "26603") {
          setShowWhatsNew(true);
        }
        localStorage.setItem("vplay_version", currentVersion);
      }
    };
    handleWhatsNew();
  }, []);

  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const closeWhatsNew = () => {
    setShowWhatsNew(false);
  };

  return (
    <MotionConfig 
      transition={featureFlags.disable_animation ? { duration: 0 } : undefined}
      reducedMotion={featureFlags.disable_animation ? "always" : "user"}
    >
      <AnimatePresence>
        {isVTV6DialogOpen && (
          <LiquidModal 
            isOpen={isVTV6DialogOpen} 
            onClose={() => setIsVTV6DialogOpen(false)} 
            isDark={isDark} 
            liquidGlass={liquidGlass}
            title="Coming soon - VTV6 sắp trở lại!"
            description="Kênh VTV6 dự kiến trở lại vào 08/6/2026 sau gần 4 năm dừng phát sóng, với mục tiêu là kênh chuyên biệt thể thao của Đài Truyền hình Việt Nam, do Trung tâm Truyền hình Thể thao quản lý. Vplay cũng đã sẵn sàng cho sự trở lại này - Mời quý khán giả đón xem!"
          >
            <div className="mt-8 flex flex-col items-center gap-6">
              <Countdown targetDate="2026-06-08T00:00:00" isDark={isDark} />
              <button 
                onClick={() => setIsVTV6DialogOpen(false)}
                className="w-full btn-vibrant-3d py-4 text-sm font-bold uppercase tracking-widest !rounded-2xl"
              >
                Đóng thông báo
              </button>
            </div>
          </LiquidModal>
        )}
        {showWhatsNew && (
          <WhatsNewPopup 
            isDark={isDark} 
            onClose={closeWhatsNew} 
            liquidGlass={liquidGlass} 
          />
        )}
        <LiquidModal 
          isOpen={isLockModalOpen} 
          onClose={() => setIsLockModalOpen(false)}
          isDark={isDark}
          liquidGlass={liquidGlass}
          title="Chúng tôi sẽ sớm trở lại..."
          description="Vplay tạm thời ngừng cung cấp dịch vụ xem truyền hình vì hiện tại các đơn vị đang siết chặt bản quyền về truyền thông. Chúng tôi sẽ sớm trở lại và có thông báo sau. Tuy nhiên các bản cập nhật giao diện, vá lỗi của Vplay Dev và Canary sẽ vẫn được phát hành. Trân trọng!"
        >
          <div className="mt-8 flex flex-col gap-3">
            <button 
              onClick={() => setIsLockModalOpen(false)} 
              className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-2xl font-bold uppercase tracking-widest transition-all shadow-lg shadow-fuchsia-600/20 active:scale-95"
            >
              Đã hiểu
            </button>
          </div>
        </LiquidModal>
      </AnimatePresence>
      <div className={`${
        isDark 
          ? "dark bg-gradient-to-br from-[#0a0118] via-[#4c0542] to-[#800539] text-white" 
          : "bg-gradient-to-br from-rose-50 via-purple-50 to-red-50 text-black"
      } min-h-screen flex font-sans transition-all duration-500 overflow-x-hidden ${useSidebar ? "flex-row" : "flex-col"} ${featureFlags.disable_animation ? "reduce-animations" : ""}`}
      style={{
        paddingLeft: useSidebar && !isMobile && !isSidebarRight ? (isSidebarExpanded ? sidebarWidth + (sidebarDisplay === "float" ? 24 : 0) : (sidebarDisplay === "float" ? 104 : 80)) : 0,
        paddingRight: useSidebar && !isMobile && isSidebarRight ? (isSidebarExpanded ? sidebarWidth + (sidebarDisplay === "float" ? 24 : 0) : (sidebarDisplay === "float" ? 104 : 80)) : 0,
        paddingTop: headingBar ? 56 : 0,
      }}
      >
      {headingBar && (
        <div 
          className="fixed top-0 left-0 right-0 z-[200] transition-all duration-300"
        >
          <TopBar 
            isDark={isDark} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchOpen={isSearchOpen}
            onMenuClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            sidebarExpanded={isSidebarExpanded}
            useSidebar={useSidebar && !isMobile}
            onSearchClick={() => {
              setIsSearchOpen(true);
            }}
            currentTime={currentTime}
            weather={weather}
            showTempInClock={showTempInClock}
            getTempDisplay={getTempDisplay}
            formatTime={formatTime}
            formatDateString={formatDateString}
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            setActiveTab={setActiveTab}
            profileStates={{
              name,
              setName,
              avatar,
              setAvatar,
              saving,
              handleSave,
              handleFileChange,
              fileInputRef,
            }}
          />
        </div>
      )}
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

      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className={`absolute inset-0 bg-black/60 backdrop-blur-md`}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col ${
                isDark ? "popup-3d-dark" : "popup-3d-light"
              } ${liquidGlass ? "backdrop-blur-3xl" : ""}`}
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-4">
                 <div className={`flex-1 flex items-center gap-4 px-6 py-4 rounded-3xl ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                    <Search className={isDark ? "text-purple-400" : "text-purple-600"} size={22} />
                    <input 
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Find and explore Vplay"
                      className={`flex-1 bg-transparent border-none outline-none text-lg font-normal ${isDark ? "text-white placeholder:text-white/30" : "text-black placeholder:text-black/30"}`}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="p-1 rounded-full hover:bg-black/10">
                        <X size={16} />
                      </button>
                    )}
                 </div>
                 <button 
                  onClick={() => setIsSearchOpen(false)}
                  className={`p-4 rounded-full transition-all active:scale-90 ${isDark ? "hover:bg-white/10" : "hover:bg-black/10"}`}
                 >
                   <X size={24} />
                 </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <SearchPopup 
                  isDark={isDark}
                  searchQuery={searchQuery}
                  setActiveChannel={handleChannelSelect}
                  onClose={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  favorites={favorites}
                  liquidGlass={liquidGlass}
                  setActiveTab={setActiveTab}
                  setIsDark={setIsDark}
                  setLiquidGlass={setLiquidGlass}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  setSortOrder={setSortOrder}
                  loadingTreatment={loadingTreatment}
                  asContent={false}
                  useSidebar={useSidebar}
                  setUseSidebar={setUseSidebar}
                  isSidebarRight={isSidebarRight}
                  setIsSidebarRight={setIsSidebarRight}
                  sidebarDisplay={sidebarDisplay}
                  setSidebarDisplay={setSidebarDisplay}
                  isPinningEnabled={isPinningEnabled}
                  setIsPinningEnabled={setIsPinningEnabled}
                  featureFlags={featureFlags}
                  setFeatureFlags={setFeatureFlags}
                  setIsSidebarLocked={setIsSidebarLocked}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col min-h-screen px-0 md:px-8 transition-all duration-500 ${
        useSidebar && !isMobile 
          ? (isSidebarRight ? "rounded-tr-[48px]" : "rounded-tl-[48px]") 
          : ""
      } ${
        isDark ? "bg-[#0a0118]/30" : "bg-white/30"
      } backdrop-blur-sm shadow-2xl`}>
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


        <div className="flex-1 overflow-y-auto pb-32 flex flex-col w-full max-w-full overflow-x-hidden">
          {/* Large Tab Header */}
          <div className="px-5 md:px-12 pt-12 pb-4">
            <motion.h1 
              key={`title-${displayTab}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl md:text-4xl font-bold tracking-tighter ${isDark ? "text-white" : "text-black"}`}
            >
              {displayTab === "Update Logs" ? "Cập nhật" : displayTab}
            </motion.h1>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={displayTab}
              initial={{ opacity: 0, y: 30, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -30, scale: 1.02, filter: "blur(10px)" }}
              transition={{ 
                duration: 0.6, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className="h-full flex flex-col pt-4 md:pt-8"
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
              {displayTab === "Khám phá" && (
                <ExploreContent 
                  isDark={isDark}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  setActiveChannel={handleChannelSelect}
                  favorites={favorites}
                  toggleFavorite={toggleFavorite}
                  liquidGlass={liquidGlass}
                  user={user}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                  setActiveTab={setActiveTab}
                  setIsDark={setIsDark}
                  setLiquidGlass={setLiquidGlass}
                  setSortOrder={setSortOrder}
                  bypassed={bypassed}
                  loadingTreatment={loadingTreatment}
                  useSidebar={useSidebar}
                  setUseSidebar={setUseSidebar}
                  isSidebarRight={isSidebarRight}
                  setIsSidebarRight={setIsSidebarRight}
                  sidebarDisplay={sidebarDisplay}
                  setSidebarDisplay={setSidebarDisplay}
                  isPinningEnabled={isPinningEnabled}
                  setIsPinningEnabled={setIsPinningEnabled}
                  featureFlags={featureFlags}
                  setFeatureFlags={setFeatureFlags}
                  setIsSidebarLocked={setIsSidebarLocked}
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
                  loadingTreatment={loadingTreatment}
                  currentTime={currentTime}
                />
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
                   {isSettingsLoading ? (
                  <div className="h-full flex flex-col items-center justify-center gap-6">
                     <LoadingSpinner isDark={isDark} className="w-16 h-16" />
                     <p className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-50 animate-pulse font-display">Preparing Settings</p>
                  </div>
               ) : (
                    <div className={`p-4 md:p-8 space-y-12 max-w-6xl mx-auto w-full ${featureFlags.rejunvenated_settings ? "h-full flex flex-col pt-0" : ""}`}>
                      {featureFlags.rejunvenated_settings ? (
                        <RejuvenatedSettings
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
                          sidebarDisplay={sidebarDisplay}
                          setSidebarDisplay={setSidebarDisplay}
                          isPinningEnabled={isPinningEnabled}
                          setIsPinningEnabled={setIsPinningEnabled}
                          user={user}
                          userData={userData}
                          setUserData={setUserData}
                          onAlert={(title, msg) => setCustomAlert({ title, message: msg })}
                          onLogin={handleLogin}
                          onUpdateLogsClick={() => setActiveTab("Update Logs")}
                          onResetOnboarding={handleResetOnboarding}
                          favorites={favorites}
                          bypassed={bypassed}
                          loadingTreatment={loadingTreatment}
                          setLoadingTreatment={setLoadingTreatment}
                          tempUnit={tempUnit}
                          setTempUnit={setTempUnit}
                          location={location}
                          setLocation={setLocation}
                          timeFormat={timeFormat}
                          setTimeFormat={setTimeFormat}
                          clockFormat={clockFormat}
                          setClockFormat={setClockFormat}
                          dateFormat={dateFormat}
                          setDateFormat={setDateFormat}
                          showTempInClock={showTempInClock}
                          setShowTempInClock={setShowTempInClock}
                          headingBar={headingBar}
                          setHeadingBar={setHeadingBar}
                        />
                      ) : (
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
                          sidebarDisplay={sidebarDisplay}
                          setSidebarDisplay={setSidebarDisplay}
                          isPinningEnabled={isPinningEnabled}
                          setIsPinningEnabled={setIsPinningEnabled}
                          user={user}
                          userData={userData}
                          setUserData={setUserData}
                          onAlert={(title, msg) => setCustomAlert({ title, message: msg })}
                          onLogin={handleLogin}
                          onUpdateLogsClick={() => setActiveTab("Update Logs")}
                          onResetOnboarding={handleResetOnboarding}
                          favorites={favorites}
                          bypassed={bypassed}
                          loadingTreatment={loadingTreatment}
                          setLoadingTreatment={setLoadingTreatment}
                          tempUnit={tempUnit}
                          setTempUnit={setTempUnit}
                          location={location}
                          setLocation={setLocation}
                          timeFormat={timeFormat}
                          setTimeFormat={setTimeFormat}
                          clockFormat={clockFormat}
                          setClockFormat={setClockFormat}
                          dateFormat={dateFormat}
                          setDateFormat={setDateFormat}
                          showTempInClock={showTempInClock}
                          setShowTempInClock={setShowTempInClock}
                          headingBar={headingBar}
                          setHeadingBar={setHeadingBar}
                        />
                      )}
                    </div>
                   )}
                </div>
              )}
              {displayTab === "Update Logs" && (
                <UpdateLogsContent isDark={isDark} onBack={() => setActiveTab("Cài đặt")} featureFlags={featureFlags} loadingTreatment={loadingTreatment} />
              )}
              {displayTab === "Lưu trữ" && (
                <EventsContent isDark={isDark} liquidGlass={liquidGlass} />
              )}
              {displayTab === "Quản trị" && isAdmin && <AdminContent isDark={isDark} liquidGlass={liquidGlass} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Sidebar Redesign */}
      <AnimatePresence>
        {useSidebar && !showSplash && (
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
                  isDark ? "bg-[#1f2937] text-white border border-white/10" : "bg-white text-slate-800 border border-slate-200"
                }`}
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
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`fixed z-[120] flex flex-col transition-all duration-300 overflow-visible ${
                isSidebarRight 
                  ? (sidebarDisplay === "float" && !isMobile ? "right-6" : "right-0") 
                  : (sidebarDisplay === "float" && !isMobile ? "left-6" : "left-0")
              } ${
                isMobile 
                  ? `${headingBar ? "top-14 h-[calc(100%-56px)]" : "top-0 h-full"} !rounded-none !m-0 !left-0 !right-0 transition-none` 
                  : sidebarDisplay === "float" 
                    ? `top-0 h-full ${headingBar ? "pt-14" : "pt-6"} pb-6 !rounded-b-[32px] ${headingBar ? "!rounded-t-none" : "!rounded-t-[32px]"} shadow-2xl`
                    : `top-0 h-full ${headingBar ? "pt-14" : ""} border-y-0 shadow-2xl`
              } ${
                isDark ? "bg-[#0a0118]/90 shadow-black/50" : "bg-[#f2f2f7] border-slate-200 shadow-xl"
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
              {!headingBar && (
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
                          className="w-10 h-10 flex items-center justify-center transition-all group overflow-hidden relative"
                        >
                          <img 
                            src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
                            alt="Vplay" 
                            className="w-8 h-8 object-contain drop-shadow-lg group-hover:scale-110 transition-transform" 
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
                            className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-white" : "hover:bg-black/5 text-black"}`}
                          >
                            <Menu size={28} />
                          </button>
                          <div className="flex items-center">
                            <img 
                              src="https://static.wikia.nocookie.net/ftv/images/a/a6/Imagedskvjndkv.png/revision/latest?cb=20260430103502&path-prefix=vi" 
                              alt="Vplay" 
                              className="h-8 w-8 object-contain drop-shadow-md"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Integrated Search Bar removed as per user request (already has Explore tab) */}
              <div className="mb-4" />

              {isSidebarExpanded && user && (
                <div className={`mx-4 mb-6 p-4 rounded-2xl flex items-center gap-3 transition-all ${isDark ? "bg-white/5 border border-white/5" : "bg-white border border-slate-200"}`}>
                   <div className="relative">
                      <img src={user.photoURL || avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0a0118]" />
                   </div>
                   <div className="flex-1 overflow-hidden">
                      <p className={`text-xs font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.displayName || name || "User"}</p>
                      <p className={`text-[9px] font-medium opacity-40 truncate ${isDark ? "text-white" : "text-slate-900"}`}>{user.email || "Offline profile"}</p>
                   </div>
                </div>
              )}

              {/* Navigation Items */}
              <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {tabs.map((tab, idx) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === (tab.id || tab.name);
                  return (
                        <button
                          key={`side-nav-${tab.id || tab.name}-${idx}`}
                          onClick={() => {
                            if (tab.id === "Phát sóng" && isBroadcastingLocked) {
                              setIsLockModalOpen(true);
                              return;
                            }
                            setActiveTab(tab.id || tab.name);
                            if (isMobile) setIsSidebarExpanded(false);
                          }}
                          className={`w-full flex items-center gap-4 px-4 py-2 rounded-xl transition-all relative group h-[44px] overflow-hidden ${
                            isActive 
                              ? (isDark ? "bg-white/10 text-fuchsia-400" : "bg-black/5 text-fuchsia-600") 
                              : (isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-black hover:bg-black/5")
                          } ${!isSidebarExpanded ? "justify-center" : ""}`}
                        >
                      {isActive && (
                        <motion.div 
                          layoutId="sidebarActivePill"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-fuchsia-400 rounded-r-sm shadow-[0_0_8px_rgba(232,121,249,0.5)]" 
                        />
                      )}
                      <Icon size={20} strokeWidth={tab.id === "Experimental" ? 1 : 1.5} className={`flex-shrink-0 transition-all ${isActive ? "text-fuchsia-400" : (isDark ? "text-white" : "text-black")} group-hover:scale-110`} />
                      {isSidebarExpanded && (
                        <span className="font-normal text-sm whitespace-nowrap">{tab.name}</span>
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
                      {Array.from(new Set(favorites)).map(favId => {
                        const channel = channels.find(c => c.name === favId);
                        if (!channel) return null;
                        return (
                          <button
                            key={`side-pin-${favId}`}
                            onClick={() => {
                              setActiveTab("Phát sóng");
                              setActiveChannel(channel);
                              if (isMobile) setIsSidebarExpanded(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group h-[44px] ${
                              isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-black hover:bg-black/5"
                            } ${!isSidebarExpanded ? "justify-center" : ""}`}
                          >
                            <img 
                              src={channel.logo} 
                              alt={channel.name}
                              className={`w-8 h-8 object-contain transition-transform group-hover:scale-110 ${!isDark ? "bg-white rounded-md shadow-sm border border-slate-100 p-0.5" : ""}`}
                              referrerPolicy="no-referrer"
                            />
                            {isSidebarExpanded && (
                              <span className="font-normal text-sm whitespace-nowrap overflow-hidden text-ellipsis">{channel.name}</span>
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
                {isSidebarExpanded && !headingBar && (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-3">
                        <div className={`text-2xl font-bold tracking-tighter font-mono ${isDark ? "text-white" : "text-slate-900"}`}>
                          {formatTime(currentTime || new Date())}
                        </div>
                        {showTempInClock && weather && <div className={`w-[1px] h-3 self-center ${isDark ? "bg-white/10" : "bg-slate-300"} mx-1`} />}
                        {showTempInClock && weather && (
                          <div className={`text-sm font-bold flex items-center gap-1.5 self-center ${isDark ? "text-yellow-400" : "text-yellow-500"}`}>
                            <Thermometer size={14} strokeWidth={1.5} />
                            {getTempDisplay()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-[10px] font-bold uppercase tracking-tight ${isDark ? "text-white/40" : "text-slate-500"}`}>
                          {formatDateString(currentTime || new Date())}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[12px] font-bold text-white tracking-widest whitespace-nowrap">
                         26M6 - Build 26604
                       </span>
                       <div className="px-1.5 py-0.5 rounded bg-cyan-400 text-[9px] font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                         <Zap size={8} fill="currentColor" /> Dev
                       </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (user) {
                      setActiveTab("Cài đặt"); // If logged in, maybe settings is under account?
                    } else {
                      handleLogin();
                    }
                    if (isMobile) setIsSidebarExpanded(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full h-[44px] relative overflow-hidden group ${
                    activeTab === "Cài đặt"
                      ? (isDark ? "bg-white/10 text-white" : "bg-black/5 text-black")
                      : (isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-black hover:bg-black/5")
                  } ${!isSidebarExpanded ? "justify-center" : ""}`}
                >
                  {activeTab === "Cài đặt" && (
                    <motion.div 
                      layoutId="sidebarActivePill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-fuchsia-400 rounded-r-sm shadow-[0_0_8px_rgba(232,121,249,0.5)]" 
                    />
                  )}
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    activeTab === "Cài đặt"
                      ? (isDark ? "bg-fuchsia-500/20 text-fuchsia-400" : "bg-fuchsia-100 text-fuchsia-600")
                      : (isDark ? "bg-white/5 text-white" : "bg-black/5 text-black")
                  }`}>
                    <AccountIcon className="w-5 h-5" />
                  </div>
                  {isSidebarExpanded && <span className={`font-normal text-sm ${activeTab === "Cài đặt" ? "text-fuchsia-400" : ""}`}>{user ? "Tài khoản" : "Đăng nhập"}</span>}
                </button>

                {!headingBar && (
                  <button
                    onClick={user ? handleLogout : handleLogin}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all w-full h-[44px] relative overflow-hidden group ${
                      isDark ? "text-white/60 hover:text-white hover:bg-white/5" : "text-black hover:bg-black/5"
                    } ${!isSidebarExpanded ? "justify-center" : ""}`}
                  >
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      user 
                        ? (isDark ? "bg-red-500/10 text-red-400 group-hover:bg-red-500/20" : "bg-red-50 text-red-500 group-hover:bg-red-100")
                        : (isDark ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100")
                    }`}>
                      {user ? <SignOutIcon size={18} /> : <SignInIcon size={18} />}
                    </div>
                    {isSidebarExpanded && (
                      <span className="font-normal text-sm whitespace-nowrap">
                        {user ? "Đăng xuất" : "Đăng nhập"}
                      </span>
                    )}
                  </button>
                )}
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
          className="flex items-center gap-1 md:gap-3 pointer-events-auto w-full max-w-lg px-4"
        >
          <motion.nav 
            className={`flex-1 flex items-center justify-between p-2 transition-all duration-500 overflow-hidden relative ${
              liquidGlass === "tinted"
                ? `rounded-full border shadow-[0_20px_40px_rgba(0,0,0,0.15)] backdrop-blur-[100px] bg-white/80 border-white/80`
                : liquidGlass === "glassy"
                  ? "rounded-full border shadow-[0_30px_60px_rgba(0,0,0,0.2)] backdrop-blur-[120px] bg-white/10 border-white/20"
                  : `rounded-none border-t w-full justify-around backdrop-blur-none shadow-2xl ${isDark ? "bg-slate-900/95 border-white/5" : "bg-white/60 border-white/40"}`
            }`}>
            
            {/* Prev Arrow */}
            <button 
              onClick={() => setNavPage((prev) => (prev - 1 + 3) % 3)}
              className={`p-2 rounded-full hover:bg-black/5 transition-colors z-20 ${isDark ? "text-white/40" : "text-black/40"}`}
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex-1 overflow-hidden relative h-12 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`nav-page-${navPage}`}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="flex items-center justify-around w-full"
                >
                  {navPage === 0 && (
                    <>
                      {baseTabs.filter(t => ["Trang chủ", "Khám phá", "Phát sóng", "Experimental"].includes(t.id || t.name)).map((tab) => {
                        const Icon = tab.icon;
                        const tabId = tab.id || tab.name;
                        const isActive = activeTab === tabId;
                        const isGlassy = liquidGlass === "glassy";
                        
                        return (
                          <div key={`mob-nav-${tabId}`} className="flex-1 flex justify-center">
                            <button
                              onClick={() => {
                                if (tabId === "Phát sóng" && isBroadcastingLocked) {
                                  setIsLockModalOpen(true);
                                  return;
                                }
                                setActiveTab(tabId);
                              }}
                              className={`relative flex flex-col items-center justify-center px-1 py-2 transition-all duration-300 group z-10 w-full ${
                                isActive 
                                  ? "text-fuchsia-400" 
                                  : isGlassy ? "text-white/70 hover:text-white" : liquidGlass === "tinted" ? "text-black hover:opacity-100 opacity-60" : isDark ? "text-slate-400 hover:text-white" : "text-black hover:opacity-100"
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
                                className="z-10"
                              >
                                <Icon className="h-7 w-7 flex-shrink-0" />
                              </motion.div>
                            </button>
                          </div>
                        );
                      })}
                    </>
                  )}

                  {navPage === 1 && (
                    <div className="flex w-full items-center justify-around h-full">
                      {baseTabs.filter(t => ["Lưu trữ", "Cài đặt", "Quản trị"].includes(t.id || t.name)).filter(t => t.id !== "Quản trị" || isAdmin).map((tab) => {
                        const Icon = tab.icon;
                        const tabId = tab.id || tab.name;
                        const isActive = activeTab === tabId;
                        const isGlassy = liquidGlass === "glassy";
                        
                        return (
                          <div key={`mob-nav-${tabId}`} className="flex-1 flex justify-center">
                            <button
                              onClick={() => {
                                if (tabId === "Phát sóng" && isBroadcastingLocked) {
                                  setIsLockModalOpen(true);
                                  return;
                                }
                                setActiveTab(tabId);
                              }}
                              className={`relative flex flex-col items-center justify-center px-1 py-2 transition-all duration-300 group z-10 w-full ${
                                isActive 
                                  ? "text-fuchsia-400" 
                                  : isGlassy ? "text-white/70 hover:text-white" : liquidGlass === "tinted" ? "text-black hover:opacity-100 opacity-60" : isDark ? "text-slate-400 hover:text-white" : "text-black hover:opacity-100"
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
                                className="z-10"
                              >
                                <Icon className="h-7 w-7 flex-shrink-0" />
                              </motion.div>
                            </button>
                          </div>
                        );
                      })}
                      <div className="flex-1 flex justify-center">
                        <button
                          onClick={user ? handleLogout : handleLogin}
                          className={`p-3 rounded-full transition-all ${
                            user 
                              ? (isDark ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-red-50 text-red-500 hover:bg-red-100")
                              : (isDark ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-emerald-50 text-emerald-500 hover:bg-emerald-100")
                          }`}
                        >
                          <div className="scale-110">
                            {user ? <SignOutIcon size={28} /> : <SignInIcon size={28} />}
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {navPage === 2 && (
                    <motion.div 
                      className="flex flex-col items-center justify-center h-full gap-0"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <div className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        {formatTime(currentTime || new Date())}
                      </div>
                      <div className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? "text-white/40" : "text-slate-500"}`}>
                        {formatDateString(currentTime || new Date())}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Arrow */}
            <button 
              onClick={() => setNavPage((prev) => (prev + 1) % 3)}
              className={`p-2 rounded-full hover:bg-black/5 transition-colors z-20 ${isDark ? "text-white/40" : "text-black/40"}`}
            >
              <ChevronRight size={24} />
            </button>
          </motion.nav>
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
