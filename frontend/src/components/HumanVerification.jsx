// HumanVerification.jsx — Composant de vérification humaine premium
// Puzzle Slider interactif + Challenge Emoji + Analyse temporelle anti-bot

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, Fingerprint } from 'lucide-react'

// ── Configuration ──────────────────────────────────────────
const PUZZLE_WIDTH = 280
const PUZZLE_HEIGHT = 160
const PIECE_SIZE = 42
const TOLERANCE = 6 // px tolerance for the slider
const MIN_HUMAN_TIME_MS = 600 // Minimum time a human would take
const EMOJI_SETS = [
  { question: '🐱', options: ['🐱', '🐶', '🐸', '🦊', '🐰', '🐼'], answer: 0 },
  { question: '🌙', options: ['☀️', '🌙', '⭐', '🌈', '⚡', '❄️'], answer: 1 },
  { question: '🍎', options: ['🍌', '🍇', '🍊', '🍎', '🍓', '🫐'], answer: 3 },
  { question: '🎵', options: ['🎨', '📷', '🎵', '🎮', '📚', '🏀'], answer: 2 },
  { question: '🚀', options: ['✈️', '🚗', '🚢', '🚀', '🏍️', '🚲'], answer: 3 },
  { question: '🌺', options: ['🌻', '🌹', '🌺', '🌷', '🌸', '💐'], answer: 2 },
  { question: '🦋', options: ['🐝', '🦋', '🐛', '🐞', '🦗', '🐜'], answer: 1 },
  { question: '🎸', options: ['🎸', '🎹', '🥁', '🎺', '🎻', '🪗'], answer: 0 },
]

// ── Canvas Puzzle Generator ────────────────────────────────
function generatePuzzlePattern(ctx, width, height) {
  // Create a geometric pattern as "image"
  const colors = [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
    ['#a18cd1', '#fbc2eb'],
  ]
  const [c1, c2] = colors[Math.floor(Math.random() * colors.length)]
  
  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, c1)
  grad.addColorStop(1, c2)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Add geometric shapes
  for (let i = 0; i < 12; i++) {
    ctx.beginPath()
    const x = Math.random() * width
    const y = Math.random() * height
    const r = 10 + Math.random() * 30
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.05 + Math.random() * 0.12})`
    ctx.fill()
  }

  // Add lines
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * width, Math.random() * height)
    ctx.lineTo(Math.random() * width, Math.random() * height)
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + Math.random() * 0.1})`
    ctx.lineWidth = 1 + Math.random() * 2
    ctx.stroke()
  }

  // Add small diamonds
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const s = 4 + Math.random() * 8
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.PI / 4)
    ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + Math.random() * 0.1})`
    ctx.fillRect(-s / 2, -s / 2, s, s)
    ctx.restore()
  }
}

function drawPuzzlePiece(ctx, x, y, size, operation) {
  const tab = size * 0.22
  ctx.beginPath()
  ctx.moveTo(x, y)
  // Top
  ctx.lineTo(x + size * 0.35, y)
  ctx.bezierCurveTo(
    x + size * 0.35, y - tab,
    x + size * 0.65, y - tab,
    x + size * 0.65, y
  )
  ctx.lineTo(x + size, y)
  // Right
  ctx.lineTo(x + size, y + size * 0.35)
  ctx.bezierCurveTo(
    x + size + tab, y + size * 0.35,
    x + size + tab, y + size * 0.65,
    x + size, y + size * 0.65
  )
  ctx.lineTo(x + size, y + size)
  // Bottom
  ctx.lineTo(x + size * 0.65, y + size)
  ctx.bezierCurveTo(
    x + size * 0.65, y + size + tab,
    x + size * 0.35, y + size + tab,
    x + size * 0.35, y + size
  )
  ctx.lineTo(x, y + size)
  ctx.closePath()

  if (operation === 'clip') {
    ctx.clip()
  } else if (operation === 'fill') {
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

// ── Main Component ─────────────────────────────────────────
export default function HumanVerification({ onVerified, variant = 'light' }) {
  const [step, setStep] = useState(1) // 1: slider puzzle, 2: emoji, 3: verified
  const [sliderX, setSliderX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [sliderResult, setSliderResult] = useState('pending') // pending | success | error
  const [emojiSet, setEmojiSet] = useState(null)
  const [emojiResult, setEmojiResult] = useState('pending')
  const [startTime, setStartTime] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shakeError, setShakeError] = useState(false)
  const [puzzleTarget, setPuzzleTarget] = useState({ x: 0, y: 0 })
  const [mouseTrail, setMouseTrail] = useState([]) // Anti-bot: track mouse movement pattern

  const canvasRef = useRef(null)
  const pieceCanvasRef = useRef(null)
  const sliderTrackRef = useRef(null)
  const dragStartRef = useRef(0)

  const isDark = variant === 'dark'

  // ── Initialize puzzle ──────────────────────────────────
  const initPuzzle = useCallback(() => {
    setSliderX(0)
    setSliderResult('pending')
    setEmojiResult('pending')
    setStep(1)
    setStartTime(Date.now())
    setMouseTrail([])
    setShakeError(false)

    // Random emoji set
    setEmojiSet(EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)])

    // Random puzzle piece position
    const targetX = 100 + Math.floor(Math.random() * (PUZZLE_WIDTH - PIECE_SIZE - 120))
    const targetY = 20 + Math.floor(Math.random() * (PUZZLE_HEIGHT - PIECE_SIZE - 40))
    setPuzzleTarget({ x: targetX, y: targetY })
  }, [])

  useEffect(() => {
    initPuzzle()
  }, [initPuzzle])

  // ── Draw canvas ────────────────────────────────────────
  useEffect(() => {
    if (step !== 1) return
    const canvas = canvasRef.current
    const pieceCanvas = pieceCanvasRef.current
    if (!canvas || !pieceCanvas) return

    const ctx = canvas.getContext('2d')
    const pieceCtx = pieceCanvas.getContext('2d')

    // Draw main canvas
    generatePuzzlePattern(ctx, PUZZLE_WIDTH, PUZZLE_HEIGHT)

    // Draw hole
    drawPuzzlePiece(ctx, puzzleTarget.x, puzzleTarget.y, PIECE_SIZE, 'fill')

    // Draw draggable piece
    pieceCanvas.width = PIECE_SIZE + 20
    pieceCanvas.height = PIECE_SIZE + 20
    pieceCtx.clearRect(0, 0, pieceCanvas.width, pieceCanvas.height)

    // Save state and clip to puzzle shape
    pieceCtx.save()
    drawPuzzlePiece(pieceCtx, 5, 5, PIECE_SIZE, 'clip')

    // Copy the area from the main pattern
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = PUZZLE_WIDTH
    tempCanvas.height = PUZZLE_HEIGHT
    const tempCtx = tempCanvas.getContext('2d')
    generatePuzzlePattern(tempCtx, PUZZLE_WIDTH, PUZZLE_HEIGHT)
    pieceCtx.drawImage(
      tempCanvas,
      puzzleTarget.x - 5, puzzleTarget.y - 5, PIECE_SIZE + 20, PIECE_SIZE + 20,
      0, 0, PIECE_SIZE + 20, PIECE_SIZE + 20
    )
    pieceCtx.restore()

    // Border for the piece
    drawPuzzlePiece(pieceCtx, 5, 5, PIECE_SIZE, 'fill')
    pieceCtx.save()
    drawPuzzlePiece(pieceCtx, 5, 5, PIECE_SIZE, 'clip')
    pieceCtx.drawImage(
      tempCanvas,
      puzzleTarget.x - 5, puzzleTarget.y - 5, PIECE_SIZE + 20, PIECE_SIZE + 20,
      0, 0, PIECE_SIZE + 20, PIECE_SIZE + 20
    )
    pieceCtx.restore()

    // Outline
    pieceCtx.beginPath()
    drawPuzzlePiece(pieceCtx, 5, 5, PIECE_SIZE, 'clip')
    pieceCtx.strokeStyle = 'rgba(255,255,255,0.8)'
    pieceCtx.lineWidth = 2
    pieceCtx.stroke()
  }, [step, puzzleTarget])

  // ── Slider drag handlers ───────────────────────────────
  const handleDragStart = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    dragStartRef.current = clientX - sliderX
  }, [sliderX])

  const handleDragMove = useCallback((e) => {
    if (!isDragging) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const track = sliderTrackRef.current
    if (!track) return
    const trackRect = track.getBoundingClientRect()
    const maxX = trackRect.width - 44 // thumb width
    let newX = clientX - dragStartRef.current
    newX = Math.max(0, Math.min(newX, maxX))
    setSliderX(newX)

    // Anti-bot: record trail
    setMouseTrail(prev => [...prev.slice(-30), { x: clientX, y: e.touches ? e.touches[0].clientY : e.clientY, t: Date.now() }])
  }, [isDragging])

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)

    // Calculate if puzzle piece matches target
    const track = sliderTrackRef.current
    if (!track) return
    const trackRect = track.getBoundingClientRect()
    const maxSlider = trackRect.width - 44
    const ratio = sliderX / maxSlider
    const pieceX = ratio * (PUZZLE_WIDTH - PIECE_SIZE)

    const elapsed = Date.now() - startTime

    // Anti-bot checks
    const isHumanSpeed = elapsed > MIN_HUMAN_TIME_MS
    const hasVariedTrail = mouseTrail.length > 5
    const isMatch = Math.abs(pieceX - puzzleTarget.x) < TOLERANCE

    if (isMatch && isHumanSpeed && hasVariedTrail) {
      setSliderResult('success')
      setIsAnimating(true)
      setTimeout(() => {
        setStep(2)
        setIsAnimating(false)
      }, 800)
    } else {
      setSliderResult('error')
      setShakeError(true)
      setTimeout(() => {
        setShakeError(false)
        setSliderX(0)
        setSliderResult('pending')
        // Re-generate puzzle
        const newTargetX = 100 + Math.floor(Math.random() * (PUZZLE_WIDTH - PIECE_SIZE - 120))
        const newTargetY = 20 + Math.floor(Math.random() * (PUZZLE_HEIGHT - PIECE_SIZE - 40))
        setPuzzleTarget({ x: newTargetX, y: newTargetY })
        setMouseTrail([])
      }, 600)
    }
  }, [isDragging, sliderX, puzzleTarget, startTime, mouseTrail])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove)
      window.addEventListener('mouseup', handleDragEnd)
      window.addEventListener('touchmove', handleDragMove, { passive: false })
      window.addEventListener('touchend', handleDragEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove)
      window.removeEventListener('mouseup', handleDragEnd)
      window.removeEventListener('touchmove', handleDragMove)
      window.removeEventListener('touchend', handleDragEnd)
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // ── Emoji challenge handler ────────────────────────────
  const handleEmojiSelect = useCallback((idx) => {
    if (idx === emojiSet.answer) {
      setEmojiResult('success')
      setIsAnimating(true)
      setTimeout(() => {
        setStep(3)
        setIsAnimating(false)
        onVerified?.(true)
      }, 600)
    } else {
      setEmojiResult('error')
      setShakeError(true)
      setTimeout(() => {
        setShakeError(false)
        setEmojiResult('pending')
        setEmojiSet(EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)])
      }, 500)
    }
  }, [emojiSet, onVerified])

  // ── Calculate piece visual position ────────────────────
  const pieceVisualX = useMemo(() => {
    const track = sliderTrackRef.current
    if (!track) return 0
    const trackRect = track.getBoundingClientRect()
    const maxSlider = trackRect.width - 44
    if (maxSlider <= 0) return 0
    return (sliderX / maxSlider) * (PUZZLE_WIDTH - PIECE_SIZE)
  }, [sliderX])

  // ── Render ─────────────────────────────────────────────
  const bgClass = isDark
    ? 'bg-neutral-900/80 border-neutral-700/60'
    : 'bg-white/80 dark:bg-academy-surfaceDark/80 border-gray-200/80'
  const textClass = isDark ? 'text-neutral-200' : 'text-gray-700 dark:text-academy-textMain/75'
  const subtextClass = isDark ? 'text-neutral-400 dark:text-academy-textMain/40' : 'text-gray-400 dark:text-academy-textMain/40'
  const trackBg = isDark ? 'bg-neutral-800' : 'bg-gray-100 dark:bg-white/10'

  return (
    <div
      className={`w-full rounded-2xl border ${bgClass} backdrop-blur-xl overflow-hidden transition-all duration-500 ${
        shakeError ? 'animate-shake' : ''
      }`}
      style={{
        animation: shakeError ? 'captchaShake 0.4s ease-in-out' : undefined,
      }}
    >
      {/* Header */}
      <div className={`px-4 py-2.5 flex items-center gap-2.5 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100 dark:border-academy-border'}`}>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          step === 3
            ? 'bg-green-500/15 text-green-500'
            : isDark
              ? 'bg-blue-500/15 text-blue-400'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
        }`}>
          {step === 3 ? <CheckCircle2 size={16} /> : <Fingerprint size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-bold ${textClass} tracking-wide`}>
            {step === 3 ? 'Vérifié ✓' : 'Vérification Humaine'}
          </p>
          <p className={`text-[10px] ${subtextClass} truncate`}>
            {step === 1 && 'Glissez la pièce du puzzle à sa position'}
            {step === 2 && 'Trouvez l\'emoji identique'}
            {step === 3 && 'Vous êtes bien humain !'}
          </p>
        </div>
        {step !== 3 && (
          <button
            type="button"
            onClick={initPuzzle}
            className={`p-1.5 rounded-lg transition-all ${
              isDark
                ? 'text-neutral-500 dark:text-academy-textMain/50 hover:text-neutral-300 hover:bg-neutral-800'
                : 'text-gray-400 dark:text-academy-textMain/40 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="Réinitialiser"
          >
            <RefreshCw size={14} />
          </button>
        )}
      </div>

      {/* Step 1: Puzzle Slider */}
      {step === 1 && (
        <div className={`p-3 space-y-2.5 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100'}`}>
          {/* Canvas puzzle area */}
          <div className="relative rounded-xl overflow-hidden shadow-inner" style={{ width: PUZZLE_WIDTH, height: PUZZLE_HEIGHT, margin: '0 auto' }}>
            <canvas
              ref={canvasRef}
              width={PUZZLE_WIDTH}
              height={PUZZLE_HEIGHT}
              className="block"
            />
            {/* Floating puzzle piece */}
            <canvas
              ref={pieceCanvasRef}
              className="absolute top-0 left-0 pointer-events-none transition-none"
              style={{
                transform: `translate(${pieceVisualX - 5}px, ${puzzleTarget.y - 5}px)`,
                filter: sliderResult === 'success' ? 'drop-shadow(0 0 8px rgba(34,197,94,0.6))' : 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
              }}
            />
            {/* Success overlay */}
            {sliderResult === 'success' && (
              <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="text-green-400" size={40} />
              </div>
            )}
          </div>

          {/* Slider track */}
          <div
            ref={sliderTrackRef}
            className={`relative h-11 ${trackBg} rounded-full overflow-hidden select-none`}
            style={{ width: PUZZLE_WIDTH, margin: '0 auto' }}
          >
            {/* Progress fill */}
            <div
              className="absolute inset-y-0 left-0 rounded-full transition-none"
              style={{
                width: sliderX + 22,
                background: sliderResult === 'error'
                  ? 'linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.3))'
                  : sliderResult === 'success'
                    ? 'linear-gradient(90deg, rgba(34,197,94,0.2), rgba(34,197,94,0.3))'
                    : 'linear-gradient(90deg, rgba(59,130,246,0.1), rgba(59,130,246,0.2))',
              }}
            />
            {/* Hint text */}
            <div className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold tracking-wider uppercase ${subtextClass} pointer-events-none select-none`}>
              {sliderResult === 'pending' && '⟶ Glissez pour vérifier ⟶'}
              {sliderResult === 'error' && '✗ Réessayez'}
              {sliderResult === 'success' && '✓ Parfait !'}
            </div>
            {/* Thumb */}
            <div
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
              className={`absolute top-1 w-9 h-9 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-shadow shadow-md ${
                sliderResult === 'error'
                  ? 'bg-red-500 text-white'
                  : sliderResult === 'success'
                    ? 'bg-green-500 text-white'
                    : isDark
                      ? 'bg-blue-500 text-white hover:bg-blue-400'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
              style={{
                left: sliderX,
                transform: 'translateX(4px)',
                touchAction: 'none',
              }}
            >
              {sliderResult === 'error' ? (
                <AlertTriangle size={14} />
              ) : sliderResult === 'success' ? (
                <CheckCircle2 size={14} />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Emoji Challenge */}
      {step === 2 && emojiSet && (
        <div className={`p-4 space-y-3 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100'}`}>
          <div className="text-center space-y-1.5">
            <div className="text-4xl animate-bounce-slow">{emojiSet.question}</div>
            <p className={`text-xs font-semibold ${subtextClass}`}>
              Cliquez sur l'emoji identique ci-dessous
            </p>
          </div>
          <div className="grid grid-cols-6 gap-2 max-w-[280px] mx-auto">
            {emojiSet.options.map((emoji, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleEmojiSelect(idx)}
                className={`aspect-square rounded-xl text-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
                  isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700'
                    : 'bg-gray-50 dark:bg-white/5 hover:bg-white border border-gray-200 dark:border-academy-border hover:border-blue-300'
                } ${emojiResult === 'error' ? 'animate-pulse' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Verified */}
      {step === 3 && (
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/15 flex items-center justify-center">
            <ShieldCheck className="text-green-500" size={20} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600 dark:text-green-400'}`}>
              Vérification réussie
            </p>
            <p className={`text-[10px] ${subtextClass}`}>
              Identité humaine confirmée
            </p>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-green-500"
                style={{ animation: `captchaDot 1.2s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Inline styles for animations */}
      <style>{`
        @keyframes captchaShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes captchaDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes bounceSlowEmoji {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow {
          animation: bounceSlowEmoji 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
