'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Swords,
  Shield,
  Zap,
  Users,
  Trophy,
  ArrowRight,
  Flame,
  Globe2,
  Sparkles,
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChessBoard from '@/components/ChessBoard'

export default function LandingPage() {
  // Demonstration position for interactive hero preview
  const demoFen = 'r1bqk2r/pppp1ppp/2n5/4p3/1b1Pn3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6'

  return (
    <div className="min-h-screen bg-[#07070b] text-white flex flex-col selection:bg-emerald-500 selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Live Status Pill */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-semibold text-emerald-400"
              >
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                24/7 Real-Time Multiplayer Chess Engine
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08]"
              >
                Master the{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300">
                  Game of Kings
                </span>{' '}
                in Real-Time.
              </motion.h1>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
              >
                Challenge grandmasters and friends across the globe with zero latency. 
                Experience instant matchmaking, complete chess rules verification, 
                and clean high-performance dark aesthetic.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                <Link
                  href="/signup"
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-950/60 hover:shadow-emerald-900/50 transition-all duration-200 group"
                >
                  <Swords className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Start Playing Free
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#12131a] hover:bg-[#1a1b26] border border-white/10 px-8 py-4 text-base font-semibold text-gray-300 hover:text-white transition-all duration-200"
                >
                  Sign In to Arena
                </Link>
              </motion.div>

              {/* Trust Badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Instant Matchmaking</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>FIDE-Standard Rules</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-blue-400" />
                  <span>24/7 Global Servers</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Board Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 relative flex justify-center"
            >
              {/* Decorative Frame */}
              <div className="relative w-full max-w-[480px] p-2.5 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 shadow-2xl shadow-black/80">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 mb-2 text-xs font-mono text-gray-400">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    Live Match Simulation
                  </span>
                  <span className="text-amber-400 font-semibold">10:00 vs 09:42</span>
                </div>

                <ChessBoard
                  fen={demoFen}
                  orientation="white"
                  onMove={() => false}
                  disabled={true}
                  lastMove={{ from: 'f3', to: 'e4' }}
                />

                <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-xl bg-[#12131a] text-xs text-gray-300">
                  <span className="font-semibold text-white">White: Kasparov (2851)</span>
                  <span className="text-amber-400 font-mono">Move 6 ... Nf3-e4</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 border-t border-white/5 bg-[#0a0a0f]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-emerald-400 font-bold">
              Unrivaled Platform Architecture
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Built for Serious Chess Competitors
            </h3>
            <p className="text-sm text-gray-400">
              Every detail engineered from scratch with zero compromises on latency, accuracy, or aesthetics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                color: 'text-emerald-400',
                bg: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Sub-Millisecond Sync',
                desc: 'Moves propagate instantaneously via Supabase Realtime WebSocket pipelines for seamless tactical execution.',
              },
              {
                icon: Shield,
                color: 'text-amber-400',
                bg: 'bg-amber-500/10 border-amber-500/20',
                title: 'Certified Engine',
                desc: 'Strict chess.js validation covering en passant, pawn promotions, castling conditions, and repetition draws.',
              },
              {
                icon: Users,
                color: 'text-blue-400',
                bg: 'bg-blue-500/10 border-blue-500/20',
                title: 'Friends & Community',
                desc: 'Add players by their custom display names, monitor live presence, and challenge rivals to rapid rematches.',
              },
              {
                icon: Trophy,
                color: 'text-purple-400',
                bg: 'bg-purple-500/10 border-purple-500/20',
                title: 'Dynamic Elo Ratings',
                desc: 'Automatic rating updates and leaderboard tracking calculated instantly upon every checkmate or draw.',
              },
            ].map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="rounded-3xl bg-[#12131a] border border-white/5 p-6 hover:border-white/10 transition-all hover:-translate-y-1 group"
              >
                <div className={`p-3 rounded-2xl w-fit mb-5 border ${feat.bg}`}>
                  <feat.icon className={`h-6 w-6 ${feat.color}`} />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                  {feat.title}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-normal">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Footer (Creator Remark & Regal Crown) */}
      <Footer />
    </div>
  )
}
