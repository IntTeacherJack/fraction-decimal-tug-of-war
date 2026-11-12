import { useEffect, useMemo, useState } from 'react'
import './App.css'

const ROUND_COUNT = 10

const questionBank = [
  { fraction: '1/2', decimal: '0.7', winner: 'decimal' },
  { fraction: '3/4', decimal: '0.6', winner: 'fraction' },
  { fraction: '1/4', decimal: '0.3', winner: 'decimal' },
  { fraction: '2/5', decimal: '0.5', winner: 'decimal' },
  { fraction: '3/5', decimal: '0.45', winner: 'fraction' },
  { fraction: '7/10', decimal: '0.65', winner: 'fraction' },
  { fraction: '1/5', decimal: '0.15', winner: 'fraction' },
  { fraction: '5/8', decimal: '0.7', winner: 'decimal' },
  { fraction: '4/5', decimal: '0.75', winner: 'fraction' },
  { fraction: '3/10', decimal: '0.25', winner: 'fraction' },
  { fraction: '7/8', decimal: '0.8', winner: 'fraction' },
  { fraction: '2/3', decimal: '0.6', winner: 'fraction' },
]

function shuffledQuestions() {
  return [...questionBank].sort(() => Math.random() - 0.5).slice(0, ROUND_COUNT)
}

function App() {
  const [questions, setQuestions] = useState(shuffledQuestions)
  const [round, setRound] = useState(0)
  const [ropePosition, setRopePosition] = useState(0)
  const [scores, setScores] = useState({ left: 0, right: 0 })
  const [message, setMessage] = useState('Touch the greater value!')
  const [locked, setLocked] = useState(false)

  const question = questions[round]
  const gameOver = round >= ROUND_COUNT
  const result = useMemo(() => {
    if (!gameOver) return null
    if (scores.left === scores.right) return "It's a draw!"
    return scores.left > scores.right ? 'Blue team wins!' : 'Orange team wins!'
  }, [gameOver, scores])

  useEffect(() => {
    if (!locked) return undefined
    const nextRound = window.setTimeout(() => {
      if (round + 1 >= ROUND_COUNT) {
        setRound(ROUND_COUNT)
        setMessage('Final whistle!')
      } else {
        setRound((current) => current + 1)
        setMessage('Touch the greater value!')
      }
      setLocked(false)
    }, 900)
    return () => window.clearTimeout(nextRound)
  }, [locked, round])

  function chooseAnswer(team, answer) {
    if (locked || gameOver) return
    setLocked(true)
    const correct = answer === question.winner
    const pull = team === 'left' ? (correct ? -1 : 1) : correct ? 1 : -1
    setRopePosition((position) => Math.max(-4, Math.min(4, position + pull)))
    if (correct) {
      setScores((current) => ({ ...current, [team]: current[team] + 1 }))
      setMessage(`${team === 'left' ? 'Blue' : 'Orange'} team pulls the rope!`)
    } else {
      setMessage('Not quite — the other team pulls!')
    }
  }

  function restart() {
    setQuestions(shuffledQuestions())
    setRound(0)
    setRopePosition(0)
    setScores({ left: 0, right: 0 })
    setMessage('Touch the greater value!')
    setLocked(false)
  }

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand"><span aria-hidden="true">↔</span> Fraction, Decimal Tug of War</div>
        <div className="round">ROUND {Math.min(round + 1, ROUND_COUNT)} <span>OF {ROUND_COUNT}</span></div>
        <button className="restart" onClick={restart}>↻ New game</button>
      </header>

      <section className="teams" aria-label="Team scores">
        <div className="team blue"><span>BLUE TEAM</span><strong>{scores.left}</strong></div>
        <div className="prompt">
          <p>{gameOver ? result : message}</p>
          {!gameOver && <h1>Which value is <em>greater?</em></h1>}
        </div>
        <div className="team orange"><span>ORANGE TEAM</span><strong>{scores.right}</strong></div>
      </section>

      {!gameOver ? (
        <>
          <section className="answer-zone" aria-label="Choose the greater value">
            <div className="answer-side left-side">
              <p>BLUE TEAM — TOUCH AN ANSWER</p>
              <AnswerButtons question={question} onChoose={(answer) => chooseAnswer('left', answer)} disabled={locked} />
            </div>
            <div className="versus" aria-hidden="true">VS</div>
            <div className="answer-side right-side">
              <p>ORANGE TEAM — TOUCH AN ANSWER</p>
              <AnswerButtons question={question} onChoose={(answer) => chooseAnswer('right', answer)} disabled={locked} />
            </div>
          </section>
          <section className="rope-ground" aria-label="Tug of war rope">
            <div className="rope-track"><div className="center-line" /><div className="rope" style={{ transform: `translateX(${ropePosition * 9}%)` }}><span className="flag">⚑</span></div></div>
            <div className="pull-label left-pull">BLUE PULLS ←</div><div className="pull-label right-pull">→ ORANGE PULLS</div>
          </section>
        </>
      ) : (
        <section className="winner-card">
          <div className="trophy" aria-hidden="true">🏆</div><h2>{result}</h2><p>Thanks for playing! Ready for another ten rounds?</p><button onClick={restart}>Play again</button>
        </section>
      )}
      <footer>Two teams · One touchscreen · Big math energy</footer>
    </main>
  )
}

function AnswerButtons({ question, onChoose, disabled }) {
  return <div className="answers">
    <button className="answer fraction" onClick={() => onChoose('fraction')} disabled={disabled} aria-label={`Choose fraction ${question.fraction}`}><small>FRACTION</small><span>{question.fraction}</span></button>
    <button className="answer decimal" onClick={() => onChoose('decimal')} disabled={disabled} aria-label={`Choose decimal ${question.decimal}`}><small>DECIMAL</small><span>{question.decimal}</span></button>
  </div>
}

export default App
