'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#07070b]/90 backdrop-blur-md py-10 mt-auto relative z-30">
      <div className="mx-auto max-w-7xl px-4 flex flex-col items-center justify-center text-center">
        {/* Sleek, Regal Vector Crown & Creator Remark */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center group cursor-default"
        >
          {/* Regal Vector Crown */}
          <div className="relative mb-3.5">
            {/* Ambient Crown Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/30 to-amber-600/20 rounded-full blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
            
            <svg
              className="relative w-12 h-9 drop-shadow-[0_2px_12px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-110"
              viewBox="0 0 48 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="regalGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="30%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#D97706" />
                  <stop offset="100%" stopColor="#B45309" />
                </linearGradient>
                <linearGradient id="jewelGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FCD34D" />
                </linearGradient>
              </defs>

              {/* Crown Base Rim */}
              <path
                d="M6 31C18 33 30 33 42 31L41 27C29 29 19 29 7 27L6 31Z"
                fill="url(#regalGold)"
              />
              
              {/* Crown Peaks & Arches */}
              <path
                d="M7 27L4 12L14 20L24 5L34 20L44 12L41 27C29 29 19 29 7 27Z"
                fill="url(#regalGold)"
                stroke="#FDE68A"
                strokeWidth="0.75"
              />

              {/* 5 Crown Tip Jewels */}
              <circle cx="4" cy="11.5" r="2.2" fill="url(#jewelGlow)" />
              <circle cx="14" cy="19.5" r="2" fill="url(#jewelGlow)" />
              <circle cx="24" cy="4.5" r="2.8" fill="url(#jewelGlow)" className="animate-pulse" />
              <circle cx="34" cy="19.5" r="2" fill="url(#jewelGlow)" />
              <circle cx="44" cy="11.5" r="2.2" fill="url(#jewelGlow)" />

              {/* Embedded Center Gem */}
              <polygon
                points="24,14 27,19 24,24 21,19"
                fill="#34D399"
                stroke="#A7F3D0"
                strokeWidth="0.5"
                className="drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]"
              />
              <circle cx="15" cy="24" r="1.5" fill="#FDE68A" />
              <circle cx="33" cy="24" r="1.5" fill="#FDE68A" />
            </svg>
          </div>

          {/* Exact Creator Name */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-[10px] uppercase tracking-[0.28em] text-amber-400/80 font-semibold font-mono">
              Designed & Engineered By
            </span>
            <h3 className="text-sm font-semibold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-sm transition-all duration-300 group-hover:tracking-widest">
              Mohammad Tahsin Sr.
            </h3>
          </div>
        </motion.div>

        {/* Brand & Platform Note */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs text-gray-500 font-sans">
          <span>&copy; {new Date().getFullYear()} Chess Arena</span>
          <span className="hidden sm:inline text-white/10">•</span>
          <span className="text-gray-400">24/7 Real-Time Global Matchmaking & Competition</span>
          <span className="hidden sm:inline text-white/10">•</span>
          <span className="text-emerald-500/80 font-medium">Production Release</span>
        </div>
      </div>
    </footer>
  )
}
