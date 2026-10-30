/**
 * ANTIGRAVITY CHESS — High-Performance Mobile PWA Engine
 * Complete Custom Antigravity Physics Engine, Offline AI, Spatial Audio & PWA System
 * 
 * Exact Required Branding: "Designed and Developed by Mohammad Tahsin Sr."
 */

// ============================================================================
// 1. CONFIGURATION & MASS MATRIX
// ============================================================================

const PIECE_MASS = {
  p: 1.0,   // Pawn: lightweight, prone to drafts and drift
  n: 3.0,   // Knight: agile, parabolic rebound
  b: 3.2,   // Bishop: diagonal magnetic alignment
  r: 5.0,   // Rook: heavy mass, resistant to cross-screen drift
  q: 9.5,   // Queen: Singularity pull; attracts nearby floating pieces
  k: 12.0   // King: Cosmic anchor; center of mass
}

const GRAVITY_MODES = {
  NORMAL: { name: '1.0G NORMAL', class: 'normal-g', zMax: 0, drift: 0, reboundK: 0.18, damp: 0.82 },
  LOW_G:  { name: '0.2G LOW-G',  class: 'low-g',    zMax: 35, drift: 1.2, reboundK: 0.08, damp: 0.91 },
  ZERO_G: { name: '0.0G ZERO-G', class: 'zero-g',   zMax: 90, drift: 3.5, reboundK: 0.04, damp: 0.96 }
}

// Initial board layout (standard FEN matrix)
const INITIAL_FEN_MATRIX = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
]

// ============================================================================
// 2. AUDIO SYNTHESIZER (WEB AUDIO API - ZERO EXTERNAL ASSET DEPENDENCY)
// ============================================================================

class SpatialSoundEngine {
  constructor() {
    this.ctx = null
    this.enabled = true
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      this.ctx = new AudioCtx()
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return
    this.init()
    if (!this.ctx) return

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playLift() {
    this.playTone(320, 'sine', 0.2, 0.08)
  }

  playSnap() {
    this.playTone(180, 'triangle', 0.12, 0.15)
  }

  playCapture() {
    this.playTone(520, 'sawtooth', 0.18, 0.12)
    setTimeout(() => this.playTone(260, 'sine', 0.25, 0.1), 60)
  }

  playZeroG() {
    this.playTone(220, 'sine', 0.6, 0.15)
    setTimeout(() => this.playTone(440, 'sine', 0.7, 0.12), 100)
    setTimeout(() => this.playTone(880, 'sine', 0.8, 0.08), 220)
  }
}

// ============================================================================
// 3. BACKGROUND QUANTUM STARFIELD CANVAS
// ============================================================================

class QuantumStarfield {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.stars = []
    this.numStars = 75
    this.resize()
    window.addEventListener('resize', () => this.resize())
    this.initStars()
    this.render = this.render.bind(this)
    requestAnimationFrame(this.render)
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth
    this.height = this.canvas.height = window.innerHeight
  }

  initStars() {
    this.stars = []
    for (let i = 0; i < this.numStars; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: Math.random() * 2 + 0.5,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.3 + 0.1
      })
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height)

    // Subtle cosmic nebula glow
    const grad = this.ctx.createRadialGradient(
      this.width * 0.5, this.height * 0.4, 40,
      this.width * 0.5, this.height * 0.4, this.width * 0.8
    )
    grad.addColorStop(0, 'rgba(69, 162, 158, 0.06)')
    grad.addColorStop(0.5, 'rgba(157, 78, 221, 0.03)')
    grad.addColorStop(1, 'rgba(11, 12, 16, 0)')
    this.ctx.fillStyle = grad
    this.ctx.fillRect(0, 0, this.width, this.height)

    // Draw twinkling quantum nodes
    for (const s of this.stars) {
      s.y -= s.speed
      if (s.y < 0) {
        s.y = this.height
        s.x = Math.random() * this.width
      }
      this.ctx.beginPath()
      this.ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = `rgba(102, 252, 241, ${s.alpha})`
      this.ctx.shadowBlur = 4
      this.ctx.shadowColor = '#66FCF1'
      this.ctx.fill()
    }
    this.ctx.shadowBlur = 0

    requestAnimationFrame(this.render)
  }
}

// ============================================================================
// 4. THE ANTIGRAVITY PHYSICS ENGINE (CORE MECHANIC)
// ============================================================================

class PhysicsPiece {
  constructor(id, type, color, row, col, engine) {
    this.id = id
    this.type = type
    this.color = color
    this.row = row
    this.col = col
    this.engine = engine

    this.mass = PIECE_MASS[type.toLowerCase()] || 1.0

    // Spatial coordinates (% of board 0-100)
    this.x = col * 12.5
    this.y = row * 12.5
    this.targetX = this.x
    this.targetY = this.y

    // Velocities
    this.vx = 0
    this.vy = 0
    this.vz = 0

    // Altitude off board in pixels
    this.z = 0
    this.targetZ = 0

    // Micro-rebound oscillation parameters
    this.reboundPhase = 0
    this.reboundAmp = 0

    // Drift phase offsets
    this.floatPhaseX = Math.random() * Math.PI * 2
    this.floatPhaseY = Math.random() * Math.PI * 2
    this.floatSpeed = (0.015 / this.mass) + 0.005

    this.isDragging = false
    this.dragOffsetX = 0
    this.dragOffsetY = 0

    this.element = null
    this.shadowEl = null
  }

  setTargetSquare(row, col) {
    this.row = row
    this.col = col
    this.targetX = col * 12.5
    this.targetY = row * 12.5
  }

  triggerRebound(force = 20) {
    this.reboundAmp = force
    this.reboundPhase = 0
  }

  update(time, gMode, gVector, allPieces) {
    if (this.isDragging) return

    // 1. Z-Lift / Altitude physics based on Gravity Mode
    let desiredZ = 0
    if (gMode === 'LOW_G') {
      desiredZ = (GRAVITY_MODES.LOW_G.zMax / Math.sqrt(this.mass)) + Math.sin(time * this.floatSpeed + this.floatPhaseX) * 6
    } else if (gMode === 'ZERO_G') {
      desiredZ = (GRAVITY_MODES.ZERO_G.zMax / Math.sqrt(this.mass)) + Math.sin(time * this.floatSpeed * 1.5 + this.floatPhaseX) * 14
    }

    // Spring interpolation for altitude
    const dz = desiredZ - this.z
    this.vz = (this.vz + dz * 0.08) * 0.85
    this.z += this.vz

    // Damped Micro-rebound on square landing
    if (this.reboundAmp > 0.1) {
      this.reboundPhase += 0.25
      const damping = Math.exp(-this.reboundPhase * 0.6)
      const reboundZ = Math.sin(this.reboundPhase * 2.8) * this.reboundAmp * damping
      this.z += reboundZ
      this.reboundAmp *= 0.94
    }

    // 2. Mutual Gravitational / Singularity Pull
    let pullFx = 0
    let pullFy = 0

    if (gMode !== 'NORMAL') {
      for (const other of allPieces) {
        if (other === this) continue
        // High-mass pieces (Queen / King) exert magnetic orbital pull
        if (other.type.toLowerCase() === 'q' || other.type.toLowerCase() === 'k') {
          const dx = other.x - this.x
          const dy = other.y - this.y
          const distSq = dx * dx + dy * dy + 15
          const dist = Math.sqrt(distSq)

          if (dist < 45) { // Magnetic radius
            const force = (0.35 * other.mass) / distSq
            pullFx += (dx / dist) * force
            pullFy += (dy / dist) * force
          }
        }
      }
    }

    // 3. Gravity Vector & Drift Simulation
    let driftX = 0
    let driftY = 0

    if (gMode === 'LOW_G') {
      driftX = Math.sin(time * 0.002 + this.floatPhaseX) * (1.2 / this.mass) + (gVector.x * 2.0)
      driftY = Math.cos(time * 0.002 + this.floatPhaseY) * (1.2 / this.mass) + (gVector.y * 2.0)
    } else if (gMode === 'ZERO_G') {
      // Free floating orbital motion + steering by virtual gravity vector
      driftX = Math.sin(time * 0.003 + this.floatPhaseX) * (4.0 / this.mass) + (gVector.x * 7.5)
      driftY = Math.cos(time * 0.003 + this.floatPhaseY) * (4.0 / this.mass) + (gVector.y * 7.5)
    }

    // 4. Spring towards Board Square with Inertia
    const springK = GRAVITY_MODES[gMode].reboundK
    const damp = GRAVITY_MODES[gMode].damp

    const targetWithDriftX = this.targetX + driftX
    const targetWithDriftY = this.targetY + driftY

    const ax = (targetWithDriftX - this.x) * springK + pullFx
    const ay = (targetWithDriftY - this.y) * springK + pullFy

    this.vx = (this.vx + ax) * damp
    this.vy = (this.vy + ay) * damp

    this.x += this.vx
    this.y += this.vy

    // Soft Boundary containment in Zero-G
    if (this.x < -8) this.vx += 0.8
    if (this.x > 96) this.vx -= 0.8
    if (this.y < -12) this.vy += 0.8
    if (this.y > 98) this.vy -= 0.8

    this.renderTransform()
  }

  renderTransform() {
    if (!this.element) return

    const clampedZ = Math.max(0, this.z)
    const scale = 1 + (clampedZ * 0.0018)

    // Dynamic 3D translation
    this.element.style.transform = `translate3d(${this.x * 8}%, ${this.y * 8}%, 0px) scale(${scale})`

    // Dynamic shadow projection: expands & blurs as piece lifts
    if (this.shadowEl) {
      const shadowBlur = 4 + (clampedZ * 0.35)
      const shadowScale = Math.max(0.3, 1 - (clampedZ * 0.007))
      const shadowOpacity = Math.max(0.15, 0.75 - (clampedZ * 0.006))
      this.shadowEl.style.transform = `scale(${shadowScale})`
      this.shadowEl.style.opacity = shadowOpacity
      this.shadowEl.style.filter = `blur(${shadowBlur}px)`
    }

    if (clampedZ > 10) {
      this.element.classList.add('floating')
    } else {
      this.element.classList.remove('floating')
    }
  }
}

// ============================================================================
// 5. VECTOR SVG PIECE ICONS (INLINE CRYPTO-NEON ASSETS)
// ============================================================================

function createPieceSVG(type, color) {
  const t = type.toLowerCase()
  let innerPath = ''

  switch (t) {
    case 'p': // Pawn
      innerPath = `<circle cx="22" cy="12" r="6"/><path d="M16 34c1-6 4-9 6-13 2 4 5 7 6 13zM12 38h20v4H12z"/>`
      break
    case 'r': // Rook
      innerPath = `<path d="M12 10h5v4h3v-4h4v4h3v-4h5v8l-2 16H14L12 18zM10 38h24v4H10z"/>`
      break
    case 'n': // Knight
      innerPath = `<path d="M14 38h20v4H14zM16 34c0-7 2-12 5-15l-3-1 2-6c3 0 7 2 9 6 3 6 4 10 4 16z"/>`
      break
    case 'b': // Bishop
      innerPath = `<circle cx="22" cy="8" r="2.5"/><path d="M15 34c0-7 3-12 7-18 4 6 7 11 7 18zM12 38h20v4H12z"/><path d="M17 19h10"/>`
      break
    case 'q': // Queen
      innerPath = `<circle cx="22" cy="6" r="2.5"/><circle cx="12" cy="10" r="2"/><circle cx="32" cy="10" r="2"/><path d="M12 14l4 18h12l4-18-6 8-4-10-4 10zM10 36h24v4H10z"/>`
      break
    case 'k': // King
      innerPath = `<path d="M22 4v8M18 8h8M14 16c2-4 5-5 8-5s6 1 8 5l-2 18H16zM10 38h24v4H10z"/>`
      break
  }

  return `
    <svg viewBox="0 0 44 44" width="100%" height="100%">
      <g stroke-linecap="round" stroke-linejoin="round">
        ${innerPath}
      </g>
    </svg>
  `
}

// ============================================================================
// 6. OFFLINE RULES ENGINE & LOCAL QUANTUM AI
// ============================================================================

class AntigravityChessApp {
  constructor() {
    this.board = JSON.parse(JSON.stringify(INITIAL_FEN_MATRIX))
    this.turn = 'white' // 'white' or 'black'
    this.selectedPiece = null
    this.legalMoves = []
    this.history = []

    this.playMode = 'ai' // 'ai' or 'pass'
    this.isAiThinking = false

    // Antigravity State
    this.gravityModeKey = 'NORMAL' // 'NORMAL', 'LOW_G', 'ZERO_G'
    this.gravityVector = { x: 0, y: 0 }
    this.gyroEnabled = false

    this.physicsPieces = []
    this.sound = new SpatialSoundEngine()
    this.lastFrameTime = performance.now()

    this.hapticsEnabled = true
    this.whiteTime = 600
    this.blackTime = 600
    this.clockInterval = null

    // DOM Elements
    this.boardEl = document.getElementById('board-grid')
    this.piecesLayerEl = document.getElementById('pieces-layer')
    this.gravityPill = document.getElementById('gravity-pill')
    this.gravityPillLabel = document.getElementById('gravity-pill-label')
    this.turnLabel = document.getElementById('turn-label')
    this.vectorArrow = document.getElementById('vector-arrow')

    this.initBoardDOM()
    this.initPhysicsEntities()
    this.bindEvents()
    this.initPWA()
    this.startClock()

    // Start Physics Animation Loop
    this.physicsLoop = this.physicsLoop.bind(this)
    requestAnimationFrame(this.physicsLoop)

    // Hide splash screen smoothly after quantum initialization
    setTimeout(() => {
      const splash = document.getElementById('splash-screen')
      if (splash) splash.classList.add('fade-out')
    }, 1400)
  }

  // 1. Board DOM Initialization
  initBoardDOM() {
    this.boardEl.innerHTML = ''
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = document.createElement('div')
        const isLight = (r + c) % 2 === 0
        sq.className = `square ${isLight ? 'light' : 'dark'}`
        sq.dataset.row = r
        sq.dataset.col = c

        sq.addEventListener('click', (e) => this.handleSquareClick(r, c))
        this.boardEl.appendChild(sq)
      }
    }
  }

  // 2. Physics Entities Setup
  initPhysicsEntities() {
    this.piecesLayerEl.innerHTML = ''
    this.physicsPieces = []

    let pieceId = 0
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const pChar = this.board[r][c]
        if (!pChar) continue

        const isWhite = pChar === pChar.toUpperCase()
        const color = isWhite ? 'white' : 'black'
        const type = pChar.toLowerCase()

        const piece = new PhysicsPiece(++pieceId, type, color, r, c, this)
        const el = document.createElement('div')
        el.className = `piece-entity ${color}-piece`
        if (type === 'q') el.classList.add('singularity-queen')

        // Piece Shadow
        const shadow = document.createElement('div')
        shadow.className = 'piece-shadow'
        el.appendChild(shadow)

        // Piece SVG Wrap
        const svgWrap = document.createElement('div')
        svgWrap.className = 'piece-svg-wrap'
        svgWrap.innerHTML = createPieceSVG(type, color)
        el.appendChild(svgWrap)

        this.piecesLayerEl.appendChild(el)
        piece.element = el
        piece.shadowEl = shadow

        // Touch & Drag Handling with Inertia
        this.attachDragEvents(el, piece)
        this.physicsPieces.push(piece)
      }
    }
  }

  attachDragEvents(el, piece) {
    let startX = 0
    let startY = 0

    const onPointerDown = (e) => {
      if (this.turn !== piece.color && this.playMode === 'ai' && this.turn === 'black') return

      e.preventDefault()
      this.sound.playLift()
      this.triggerHaptic([10])

      piece.isDragging = true
      piece.z = 45 // Lift off board during drag
      startX = e.clientX || (e.touches && e.touches[0].clientX)
      startY = e.clientY || (e.touches && e.touches[0].clientY)

      this.selectPiece(piece.row, piece.col)

      window.addEventListener('pointermove', onPointerMove)
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('touchmove', onPointerMove, { passive: false })
      window.addEventListener('touchend', onPointerUp)
    }

    const onPointerMove = (e) => {
      if (!piece.isDragging) return
      e.preventDefault()

      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)

      const rect = this.boardEl.getBoundingClientRect()
      const pxX = ((clientX - rect.left) / rect.width) * 100
      const pxY = ((clientY - rect.top) / rect.height) * 100

      piece.x = pxX - 6.25
      piece.y = pxY - 6.25
      piece.renderTransform()
    }

    const onPointerUp = (e) => {
      if (!piece.isDragging) return
      piece.isDragging = false

      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('touchend', onPointerUp)

      // Calculate nearest dropped square
      const targetCol = Math.min(7, Math.max(0, Math.round(piece.x / 12.5)))
      const targetRow = Math.min(7, Math.max(0, Math.round(piece.y / 12.5)))

      if (this.isMoveLegal(piece.row, piece.col, targetRow, targetCol)) {
        this.executeMove(piece.row, piece.col, targetRow, targetCol)
      } else {
        // Rebound snap back to origin
        piece.triggerRebound(16)
        this.sound.playSnap()
        this.triggerHaptic([15, 10])
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('touchstart', onPointerDown, { passive: false })
  }

  // 3. Selection & Legal Moves Calculation
  handleSquareClick(row, col) {
    if (this.selectedPiece) {
      if (this.isMoveLegal(this.selectedPiece.row, this.selectedPiece.col, row, col)) {
        this.executeMove(this.selectedPiece.row, this.selectedPiece.col, row, col)
        return
      }
    }

    const piece = this.getPieceAt(row, col)
    if (piece && piece.color === this.turn) {
      this.selectPiece(row, col)
    } else {
      this.clearSelection()
    }
  }

  selectPiece(row, col) {
    this.selectedPiece = { row, col }
    this.legalMoves = this.calculateLegalMoves(row, col)
    this.renderHighlights()
  }

  clearSelection() {
    this.selectedPiece = null
    this.legalMoves = []
    this.renderHighlights()
  }

  renderHighlights() {
    const squares = this.boardEl.querySelectorAll('.square')
    squares.forEach((sq) => {
      sq.classList.remove('legal-target', 'legal-capture')
      const r = parseInt(sq.dataset.row)
      const c = parseInt(sq.dataset.col)

      if (this.legalMoves.some((m) => m.r === r && m.c === c)) {
        if (this.board[r][c]) {
          sq.classList.add('legal-capture')
        } else {
          sq.classList.add('legal-target')
        }
      }
    })
  }

  // 4. Offline Chess Logic Core
  isMoveLegal(fromR, fromC, toR, toC) {
    return this.legalMoves.some((m) => m.r === toR && m.c === toC)
  }

  calculateLegalMoves(r, c) {
    const char = this.board[r][c]
    if (!char) return []

    const isWhite = char === char.toUpperCase()
    const type = char.toLowerCase()
    const moves = []

    const addMove = (targetR, targetC) => {
      if (targetR < 0 || targetR > 7 || targetC < 0 || targetC > 7) return false
      const targetPiece = this.board[targetR][targetC]
      if (!targetPiece) {
        moves.push({ r: targetR, c: targetC })
        return true // Can continue sliding
      }
      const isTargetWhite = targetPiece === targetPiece.toUpperCase()
      if (isTargetWhite !== isWhite) {
        moves.push({ r: targetR, c: targetC }) // Capture
      }
      return false // Blocked
    }

    switch (type) {
      case 'p': { // Pawn
        const dir = isWhite ? -1 : 1
        const startRow = isWhite ? 6 : 1
        // Single push
        if (r + dir >= 0 && r + dir <= 7 && !this.board[r + dir][c]) {
          moves.push({ r: r + dir, c })
          // Double push
          if (r === startRow && !this.board[r + 2 * dir][c]) {
            moves.push({ r: r + 2 * dir, c })
          }
        }
        // Diagonal captures
        [-1, 1].forEach((dc) => {
          const capC = c + dc
          const capR = r + dir
          if (capR >= 0 && capR <= 7 && capC >= 0 && capC <= 7) {
            const target = this.board[capR][capC]
            if (target && (target === target.toUpperCase()) !== isWhite) {
              moves.push({ r: capR, c: capC })
            }
          }
        })
        break
      }

      case 'n': { // Knight
        const deltas = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ]
        deltas.forEach(([dr, dc]) => addMove(r + dr, c + dc))
        break
      }

      case 'b': { // Bishop
        const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        dirs.forEach(([dr, dc]) => {
          let step = 1
          while (addMove(r + dr * step, c + dc * step)) step++
        })
        break
      }

      case 'r': { // Rook
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]
        dirs.forEach(([dr, dc]) => {
          let step = 1
          while (addMove(r + dr * step, c + dc * step)) step++
        })
        break
      }

      case 'q': { // Queen
        const dirs = [
          [-1, -1], [-1, 1], [1, -1], [1, 1],
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ]
        dirs.forEach(([dr, dc]) => {
          let step = 1
          while (addMove(r + dr * step, c + dc * step)) step++
        })
        break
      }

      case 'k': { // King
        const deltas = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1],           [0, 1],
          [1, -1],  [1, 0],  [1, 1]
        ]
        deltas.forEach(([dr, dc]) => addMove(r + dr, c + dc))
        break
      }
    }

    return moves
  }

  executeMove(fromR, fromC, toR, toC) {
    const movingChar = this.board[fromR][fromC]
    const targetChar = this.board[toR][toC]

    // Capture handling
    if (targetChar) {
      const capturedPiece = this.getPieceAt(toR, toC)
      if (capturedPiece) {
        this.removePieceEntity(capturedPiece)
        this.sound.playCapture()
        this.triggerHaptic([30, 40])
      }
    } else {
      this.sound.playSnap()
      this.triggerHaptic([15])
    }

    // Pawn Promotion (Auto-promote to Queen in Zero-G)
    let finalChar = movingChar
    if (movingChar.toLowerCase() === 'p') {
      if ((movingChar === 'P' && toR === 0) || (movingChar === 'p' && toR === 7)) {
        finalChar = movingChar === 'P' ? 'Q' : 'q'
      }
    }

    this.board[toR][toC] = finalChar
    this.board[fromR][fromC] = null

    // Update Physics Piece
    const activePiece = this.getPieceAtCoords(fromR, fromC)
    if (activePiece) {
      activePiece.setTargetSquare(toR, toC)
      activePiece.triggerRebound(18)
    }

    this.clearSelection()
    this.turn = this.turn === 'white' ? 'black' : 'white'
    this.updateHUD()

    // Quantum Local AI Trigger
    if (this.playMode === 'ai' && this.turn === 'black') {
      setTimeout(() => this.runQuantumAiMove(), 450)
    }
  }

  // 5. Quantum Offline AI (Greedy Heuristic Engine)
  runQuantumAiMove() {
    const blackMoves = []

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const char = this.board[r][c]
        if (char && char === char.toLowerCase()) { // Black piece
          const moves = this.calculateLegalMoves(r, c)
          moves.forEach((m) => {
            let score = 0
            const victim = this.board[m.r][m.c]
            if (victim) {
              score = (PIECE_MASS[victim.toLowerCase()] || 1) * 10
            }
            // Prefer center control in zero-g
            score += (3.5 - Math.abs(3.5 - m.r)) + (3.5 - Math.abs(3.5 - m.c))
            blackMoves.push({ fromR: r, fromC: c, toR: m.r, toC: m.c, score })
          })
        }
      }
    }

    if (blackMoves.length === 0) return // Checkmate or stalemate

    // Sort by tactical value with slight randomness
    blackMoves.sort((a, b) => (b.score + Math.random() * 2) - (a.score + Math.random() * 2))
    const chosen = blackMoves[0]
    this.executeMove(chosen.fromR, chosen.fromC, chosen.toR, chosen.toC)
  }

  getPieceAt(row, col) {
    return this.physicsPieces.find((p) => p.row === row && p.col === col)
  }

  getPieceAtCoords(row, col) {
    return this.physicsPieces.find((p) => Math.abs(p.targetY - row * 12.5) < 1 && Math.abs(p.targetX - col * 12.5) < 1)
  }

  removePieceEntity(piece) {
    if (piece.element && piece.element.parentNode) {
      piece.element.parentNode.removeChild(piece.element)
    }
    this.physicsPieces = this.physicsPieces.filter((p) => p !== piece)
  }

  // 6. Physics Simulation Loop (60 FPS)
  physicsLoop(currentTime) {
    const dt = (currentTime - this.lastFrameTime) / 1000
    this.lastFrameTime = currentTime

    const currentMode = this.gravityModeKey

    for (const p of this.physicsPieces) {
      p.update(currentTime, currentMode, this.gravityVector, this.physicsPieces)
    }

    requestAnimationFrame(this.physicsLoop)
  }

  // 7. Antigravity Mode Toggling & Gyroscope
  cycleAntigravityMode() {
    if (this.gravityModeKey === 'NORMAL') {
      this.gravityModeKey = 'LOW_G'
    } else if (this.gravityModeKey === 'LOW_G') {
      this.gravityModeKey = 'ZERO_G'
      this.sound.playZeroG()
      this.triggerHaptic([40, 60, 40])
    } else {
      this.gravityModeKey = 'NORMAL'
      this.triggerGravityPulse()
    }

    this.updateGravityHUD()
  }

  triggerGravityPulse() {
    this.gravityVector = { x: 0, y: 0 }
    this.vectorArrow.style.transform = `rotate(0deg)`

    for (const p of this.physicsPieces) {
      p.triggerRebound(28)
    }

    this.sound.playSnap()
    this.triggerHaptic([25, 20])
  }

  updateGravityHUD() {
    const mode = GRAVITY_MODES[this.gravityModeKey]
    this.gravityPill.className = `gravity-pill ${mode.class}`
    this.gravityPillLabel.textContent = mode.name
  }

  updateHUD() {
    const isWhite = this.turn === 'white'
    this.turnLabel.textContent = isWhite ? 'WHITE TO MOVE' : 'BLACK TO MOVE'
    const turnPill = document.getElementById('turn-pill')
    if (isWhite) {
      turnPill.className = 'turn-pill white-turn'
    } else {
      turnPill.className = 'turn-pill black-turn'
    }
  }

  triggerHaptic(pattern = [15]) {
    if (this.hapticsEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(pattern)
      } catch (e) {}
    }
  }

  startClock() {
    if (this.clockInterval) clearInterval(this.clockInterval)
    const whiteEl = document.getElementById('self-timer')
    const blackEl = document.getElementById('opponent-timer')

    this.clockInterval = setInterval(() => {
      if (this.turn === 'white') {
        this.whiteTime = Math.max(0, this.whiteTime - 1)
      } else {
        this.blackTime = Math.max(0, this.blackTime - 1)
      }

      const format = (t) => {
        const m = Math.floor(t / 60)
        const s = t % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
      }

      if (whiteEl) whiteEl.textContent = format(this.whiteTime)
      if (blackEl) blackEl.textContent = format(this.blackTime)
    }, 1000)
  }

  // 8. Event Bindings
  bindEvents() {
    // Zero-G Toggle Button
    const agBtn = document.getElementById('antigravity-toggle-btn')
    agBtn.addEventListener('click', () => {
      this.cycleAntigravityMode()
    })

    // Rebound Pulse Button
    const pulseBtn = document.getElementById('gravity-pulse-btn')
    pulseBtn.addEventListener('click', () => this.triggerGravityPulse())

    // Mode Toggle (AI vs Pass & Play)
    const modeBtn = document.getElementById('mode-toggle-btn')
    const modeLabel = document.getElementById('mode-label')
    const oppName = document.getElementById('opponent-name')

    modeBtn.addEventListener('click', () => {
      if (this.playMode === 'ai') {
        this.playMode = 'pass'
        modeLabel.textContent = 'Pass&Play'
        oppName.textContent = 'Player 2 (Local)'
      } else {
        this.playMode = 'ai'
        modeLabel.textContent = 'Vs AI'
        oppName.textContent = 'Quantum Core (Local AI)'
      }
      this.triggerHaptic([15])
    })

    // Gyroscope / Device Tilt Toggle
    const gyroBtn = document.getElementById('gyro-toggle-btn')
    gyroBtn.addEventListener('click', () => {
      this.gyroEnabled = !this.gyroEnabled
      gyroBtn.classList.toggle('active', this.gyroEnabled)

      if (this.gyroEnabled && window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then((res) => {
              if (res === 'granted') {
                window.addEventListener('deviceorientation', this.handleOrientation.bind(this))
              }
            })
            .catch(() => {})
        } else {
          window.addEventListener('deviceorientation', this.handleOrientation.bind(this))
        }
      } else {
        window.removeEventListener('deviceorientation', this.handleOrientation.bind(this))
        this.gravityVector = { x: 0, y: 0 }
      }
    })

    // Audio Mute Toggle
    const soundBtn = document.getElementById('sound-btn')
    soundBtn.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled
      soundBtn.style.opacity = this.sound.enabled ? '1' : '0.4'
    })

    // About & Settings Modal
    const aboutBtn = document.getElementById('about-btn')
    const modal = document.getElementById('about-modal')
    const modalClose = document.getElementById('modal-close-btn')
    const modalOk = document.getElementById('modal-ok-btn')

    const openModal = () => modal.classList.remove('hidden')
    const closeModal = () => modal.classList.add('hidden')

    aboutBtn.addEventListener('click', openModal)
    modalClose.addEventListener('click', closeModal)
    modalOk.addEventListener('click', closeModal)

    // Modal Settings Switches
    const hapticsToggle = document.getElementById('haptics-toggle')
    if (hapticsToggle) {
      hapticsToggle.addEventListener('change', (e) => {
        this.hapticsEnabled = e.target.checked
      })
    }
  }

  handleOrientation(e) {
    if (!this.gyroEnabled) return
    const gamma = e.gamma || 0 // Left-to-Right (-90 to 90)
    const beta = e.beta || 0   // Front-to-Back (-180 to 180)

    const gx = Math.min(1.5, Math.max(-1.5, gamma / 30))
    const gy = Math.min(1.5, Math.max(-1.5, (beta - 40) / 30))

    this.gravityVector = { x: gx, y: gy }

    // Update HUD Compass Needle
    const angle = Math.atan2(gy, gx) * (180 / Math.PI) - 90
    if (this.vectorArrow) {
      this.vectorArrow.style.transform = `rotate(${angle}deg)`
    }
  }

  // 9. PWA Installation & Service Worker Integration
  initPWA() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((reg) => {
            console.log('[PWA] Service Worker active:', reg.scope)
            const badge = document.getElementById('pwa-status-badge')
            if (badge) badge.textContent = 'Offline Ready • Active'
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err)
          })
      })
    }

    // Capture Native Install Prompt Event
    let deferredPrompt = null
    const banner = document.getElementById('pwa-install-banner')
    const installBtn = document.getElementById('pwa-install-btn')
    const dismissBtn = document.getElementById('pwa-dismiss-btn')
    const installPill = document.getElementById('install-pill')

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e

      // Reveal custom glassmorphic install prompt banner
      if (banner) banner.classList.remove('hidden')
      if (installPill) installPill.classList.remove('hidden')
    })

    const triggerInstall = () => {
      if (!deferredPrompt) return
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          if (banner) banner.classList.add('hidden')
          if (installPill) installPill.classList.add('hidden')
        }
        deferredPrompt = null
      })
    }

    if (installBtn) installBtn.addEventListener('click', triggerInstall)
    if (installPill) installPill.addEventListener('click', triggerInstall)

    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        if (banner) banner.classList.add('hidden')
      })
    }

    window.addEventListener('appinstalled', () => {
      if (banner) banner.classList.add('hidden')
      if (installPill) installPill.classList.add('hidden')
      console.log('[PWA] App successfully installed on device!')
    })
  }
}

// ============================================================================
// 7. INITIALIZE ENGINE ON DOM CONTENT LOADED
// ============================================================================

window.addEventListener('DOMContentLoaded', () => {
  // Initialize Background Starfield
  const spaceCanvas = document.getElementById('space-canvas')
  if (spaceCanvas) {
    new QuantumStarfield(spaceCanvas)
  }

  // Initialize Core Antigravity Chess PWA
  window.antigravityApp = new AntigravityChessApp()
})
