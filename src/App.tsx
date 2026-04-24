import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Container,
  LinearProgress,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
} from '@mui/material'

const C = {
  bg: '#17181b',
  bgPaper: '#1d1e21',
  accent: '#646b3c',
  accentHover: '#535a30',
  textPrimary: '#cdcbc8',
  textSecondary: '#b9b8ae',
  textMuted: '#6e6f6a',
  textDim: '#3e3f3a',
  border: '#252620',
  borderMid: '#2e2f2a',
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: C.accent },
    background: { default: C.bg, paper: C.bgPaper },
    text: { primary: C.textPrimary, secondary: C.textSecondary },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 700,
          letterSpacing: '0.01em',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 2, backgroundColor: C.border },
        bar: { borderRadius: 2, backgroundColor: C.accent },
      },
    },
  },
})

type Screen = 'landing' | 'quiz' | 'analyzing' | 'result'
type ResultKey = 'metabolic' | 'hormonal' | 'architectural' | 'systemic'

const QUESTIONS = [
  'Do you hit a wall before 3pm regardless of how much sleep you got the night before?',
  'Do you eat well during the day and then find yourself losing control around food at night?',
  'Do you gain weight noticeably faster during stressful periods even when your diet stays roughly the same?',
  'Have you ever done everything right — clean diet, consistent training — and still had the scale not move for weeks?',
  'Do you fall asleep fine but wake up somewhere between 2am and 4am regularly?',
  'Do you wake up after seven or eight hours and still feel like you need another two?',
  'Has your focus and mental sharpness at work quietly declined over the last few years?',
  'Do you start a new approach with real motivation and find yourself back at zero within three to four weeks, every single time?',
]

const PILLAR_MAP = [1, 1, 2, 2, 3, 3, 4, 5]

const RESULTS: Record<ResultKey, { headline: string; body: string; cost: string }> = {
  metabolic: {
    headline: 'Your gap is metabolic.',
    body: 'Your blood sugar is collapsing and your body is flooding cortisol to compensate. This is happening multiple times a day, every day, and it is costing you your afternoon focus, your evening cravings, and your body composition simultaneously. The crash you feel before 3pm is not tiredness. It is your body running out of clean fuel and reaching for the easiest fix it can find. Every coffee you drink to push through is making the root cause worse, not better. This is the most fixable gap on the list and the fastest one to feel once the input sequence changes.',
    cost: 'Your afternoon cognitive output, your evening food decisions, and the stable energy you used to have without thinking about it.',
  },
  hormonal: {
    headline: 'Your gap is hormonal.',
    body: "Your body is running a higher priority program than energy production or fat loss right now. Chronic cortisol elevation has shifted your body's priority hierarchy. Fat oxidation moves down the list. You can be in a calorie deficit, hitting your protein, training consistently, and still wonder why nothing is moving. That is not a discipline failure. That is a hormonal environment problem. Your body is not broken. It is doing exactly what it was designed to do under the conditions you are giving it. The inputs are correct. The environment running underneath them is not.",
    cost: 'Your body composition, your recovery, your drive, and the feeling that effort should be producing more than it is.',
  },
  architectural: {
    headline: 'Your gap is architectural.',
    body: 'Your brain is wired for visible progress, real stakes, and a payoff it can feel. This is not a character flaw. It is the same neurological wiring that makes you exceptional at your job. Every conventional fitness system is built for a different brain. No scoreboard, no levels, no visible progress until month three. Just a meal plan and a demand for willpower. Your brain disconnects and you call it failure. It is not failure. You have been running a system designed for someone else entirely. The information has never been your problem. The operating system underneath it has.',
    cost: 'Every restart, every lost streak, and every month of compounding biological dysfunction while you try to figure out why the same approach keeps breaking.',
  },
  systemic: {
    headline: 'Your gap is systemic.',
    body: 'Multiple biological systems are compounding against each other simultaneously. Your energy, your stress response, your sleep architecture, and your ability to stay connected to any system long enough to see results are all broken at the same time. This is the most common result for men who have been in this state for more than two years and have tried fixing one thing at a time without moving the needle. That is not a coincidence. These systems do not operate in isolation. They feed each other. Fixing one while the others run uncorrected is why every previous attempt has eventually collapsed. This is not the hardest gap to close. It is just the one that requires all the variables addressed in the right sequence simultaneously.',
    cost: 'Everything. Your output, your body, your energy, your identity. All of it running below what it should be, quietly, every single day.',
  },
}

function getResult(answers: boolean[]): ResultKey {
  const scores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  answers.forEach((yes, i) => {
    if (yes) scores[PILLAR_MAP[i]]++
  })

  const pillarsWithPoints = Object.values(scores).filter(v => v > 0).length
  if (pillarsWithPoints >= 3) return 'systemic'

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore === 0) return 'metabolic'

  const topPillars = Object.entries(scores)
    .filter(([, v]) => v === maxScore)
    .map(([k]) => Number(k))

  if (topPillars.length > 1) return 'systemic'

  const top = topPillars[0]
  if (top === 1) return 'metabolic'
  if (top === 2) return 'hormonal'
  return 'architectural'
}

function ScreenWrap({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        ...(center && { alignItems: 'center', justifyContent: 'center' }),
      }}
    >
      {children}
    </Box>
  )
}

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <ScreenWrap center>
      <Container maxWidth="sm" sx={{ px: { xs: 3, sm: 4 }, py: 8, textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: C.accent,
            textTransform: 'uppercase',
            mb: 4,
          }}
        >
          Performance Diagnostic
        </Typography>

        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '2.4rem', sm: '3rem', md: '3.5rem' },
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: C.textPrimary,
            mb: 3,
          }}
        >
          The Energy Gap
          <br />
          Diagnostic
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1.05rem', sm: '1.2rem' },
            fontWeight: 500,
            color: C.textSecondary,
            lineHeight: 1.6,
            mb: 4,
            maxWidth: 440,
            mx: 'auto',
          }}
        >
          Find out exactly which biological system is creating your gap.
        </Typography>

        <Box sx={{ width: 40, height: 2, bgcolor: C.accent, mx: 'auto', mb: 4, opacity: 0.6 }} />

        <Typography
          sx={{
            fontSize: { xs: '0.95rem', sm: '1rem' },
            color: C.textMuted,
            lineHeight: 1.7,
            mb: 6,
            maxWidth: 400,
            mx: 'auto',
          }}
        >
          Eight questions. Two minutes.{' '}
          <Box component="span" sx={{ color: C.textSecondary }}>
            A diagnosis most men never get without a coaching call.
          </Box>
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={onStart}
          sx={{
            bgcolor: C.accent,
            color: C.textPrimary,
            fontSize: { xs: '1rem', sm: '1.05rem' },
            fontWeight: 800,
            px: 5,
            py: 1.75,
            mb: 2,
            '&:hover': { bgcolor: C.accentHover },
          }}
        >
          Find my gap
        </Button>

        <Typography sx={{ fontSize: '0.75rem', color: C.textDim, letterSpacing: '0.02em' }}>
          Used by high-performing men who are done guessing.
        </Typography>
      </Container>
    </ScreenWrap>
  )
}

function QuizScreen({
  question,
  questionIndex,
  total,
  onAnswer,
}: {
  question: string
  questionIndex: number
  total: number
  onAnswer: (yes: boolean) => void
}) {
  const progress = (questionIndex / total) * 100

  return (
    <ScreenWrap>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 3 }} />
      </Box>

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          px: { xs: 3, sm: 4 },
          py: { xs: 10, sm: 8 },
          minHeight: '100dvh',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: C.accent,
            textTransform: 'uppercase',
            mb: 5,
          }}
        >
          {questionIndex + 1} of {total}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '1.35rem', sm: '1.7rem' },
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            color: C.textPrimary,
            mb: 8,
          }}
        >
          {question}
        </Typography>

        <Stack direction="column" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => onAnswer(true)}
            sx={{
              borderColor: C.borderMid,
              color: C.textPrimary,
              fontSize: { xs: '1rem', sm: '1.05rem' },
              fontWeight: 700,
              py: 2,
              '&:hover': {
                borderColor: C.accent,
                bgcolor: 'rgba(100, 107, 60, 0.08)',
                color: C.accent,
              },
            }}
          >
            Yes
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => onAnswer(false)}
            sx={{
              borderColor: C.borderMid,
              color: C.textMuted,
              fontSize: { xs: '1rem', sm: '1.05rem' },
              fontWeight: 700,
              py: 2,
              '&:hover': {
                borderColor: C.border,
                bgcolor: 'rgba(205, 203, 200, 0.03)',
                color: C.textSecondary,
              },
            }}
          >
            No
          </Button>
        </Stack>
      </Container>
    </ScreenWrap>
  )
}

function AnalyzingScreen({ progress }: { progress: number }) {
  return (
    <ScreenWrap center>
      <Container maxWidth="xs" sx={{ textAlign: 'center', px: 4 }}>
        <Typography
          sx={{
            fontSize: { xs: '1.4rem', sm: '1.7rem' },
            fontWeight: 700,
            letterSpacing: '-0.01em',
            mb: 5,
            color: C.textPrimary,
          }}
        >
          Analyzing your gap.
        </Typography>
        <LinearProgress variant="determinate" value={progress} sx={{ height: 3, borderRadius: 2 }} />
      </Container>
    </ScreenWrap>
  )
}

function ResultScreen({ resultKey }: { resultKey: ResultKey }) {
  const result = RESULTS[resultKey]

  return (
    <ScreenWrap>
      <Container maxWidth="sm" sx={{ px: { xs: 3, sm: 4 }, pt: { xs: 8, sm: 10 }, pb: 12 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: C.accent,
            textTransform: 'uppercase',
            mb: 3,
          }}
        >
          Your Diagnosis
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '2rem', sm: '2.6rem' },
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: C.textPrimary,
            mb: 5,
          }}
        >
          {result.headline}
        </Typography>

        <Box sx={{ width: 36, height: 2, bgcolor: C.accent, mb: 5, opacity: 0.7 }} />

        <Typography
          sx={{
            fontSize: { xs: '1rem', sm: '1.05rem' },
            color: C.textSecondary,
            lineHeight: 1.8,
            mb: 6,
          }}
        >
          {result.body}
        </Typography>

        <Box sx={{ borderLeft: `2px solid ${C.accent}`, pl: 3, mb: 10 }}>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.15em',
              color: C.accent,
              textTransform: 'uppercase',
              mb: 1.5,
            }}
          >
            What this is costing you right now
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: C.textMuted,
              lineHeight: 1.7,
            }}
          >
            {result.cost}
          </Typography>
        </Box>

        <Box sx={{ borderTop: `1px solid ${C.border}`, pt: 8 }}>
          <Typography
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontWeight: 800,
              letterSpacing: '-0.015em',
              lineHeight: 1.25,
              color: C.textPrimary,
              mb: 4,
            }}
          >
            Here is what closing this gap actually looks like.
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '0.95rem', sm: '1rem' },
              color: C.textMuted,
              lineHeight: 1.8,
              mb: 6,
            }}
          >
            I went through the same thing. I built a full breakdown of the system behind this
            because I needed someone to explain it to me the way I am explaining it to you now.
            The three mechanisms that explain why every approach you have tried has eventually
            broken down — biological debt, identity gravity, and reward engineering — and what
            performance architecture looks like when all of it gets addressed at the same time.
            Awareness is everything. This is where it starts.
          </Typography>

          <Button
            variant="contained"
            size="large"
            href="#"
            sx={{
              bgcolor: C.accent,
              color: C.textPrimary,
              fontSize: { xs: '1rem', sm: '1.05rem' },
              fontWeight: 800,
              px: 5,
              py: 1.75,
              mb: 2,
              display: 'block',
              textAlign: 'center',
              '&:hover': { bgcolor: C.accentHover },
            }}
          >
            Watch the full breakdown
          </Button>

          <Typography sx={{ fontSize: '0.75rem', color: C.textDim, letterSpacing: '0.02em' }}>
            The complete system. Start here.
          </Typography>
        </Box>
      </Container>
    </ScreenWrap>
  )
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [analyzeProgress, setAnalyzeProgress] = useState(0)
  const [result, setResult] = useState<ResultKey | null>(null)

  useEffect(() => {
    if (screen !== 'analyzing') return
    setAnalyzeProgress(0)
    const interval = setInterval(() => {
      setAnalyzeProgress(p => Math.min(p + 5, 100))
    }, 100)
    const timeout = setTimeout(() => setScreen('result'), 2200)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [screen])

  function handleAnswer(yes: boolean) {
    const newAnswers = [...answers, yes]
    setAnswers(newAnswers)
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(q => q + 1)
    } else {
      setResult(getResult(newAnswers))
      setScreen('analyzing')
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {screen === 'landing' && <LandingScreen onStart={() => setScreen('quiz')} />}
      {screen === 'quiz' && (
        <QuizScreen
          question={QUESTIONS[currentQ]}
          questionIndex={currentQ}
          total={QUESTIONS.length}
          onAnswer={handleAnswer}
        />
      )}
      {screen === 'analyzing' && <AnalyzingScreen progress={analyzeProgress} />}
      {screen === 'result' && result && <ResultScreen resultKey={result} />}
    </ThemeProvider>
  )
}
