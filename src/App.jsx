import { useEffect, useRef, useState } from 'react'
import './App.css'

const TOPICS = [
  'Terminating or recurring',
  'Simplifying fractions',
  'Decimals into fractions',
  'Fraction & decimal conversions',
  'HCF in a fraction',
  'Simple algebra',
]

const gcd = (a, b) => (b ? gcd(b, a % b) : a)
const pick = (items) => items[Math.floor(Math.random() * items.length)]
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5)

function formatFraction(top, bottom) {
  return `${top}/${bottom}`
}

function generateQuestion(topic) {
  if (topic === 'Terminating or recurring') {
    const terminating = Math.random() < 0.5
    const denominators = terminating ? [2, 4, 5, 8, 10, 20, 25] : [3, 6, 7, 9, 11, 12, 15]
    const bottom = pick(denominators)
    const top = pick(Array.from({ length: bottom - 1 }, (_, index) => index + 1).filter((number) => gcd(number, bottom) === 1))
    return makeQuestion(topic, `Is ${formatFraction(top, bottom)} a terminating or recurring decimal?`, ['Terminating', 'Recurring'], terminating ? 'Terminating' : 'Recurring', `${top}/${bottom}`)
  }

  if (topic === 'Simplifying fractions') {
    const divisor = pick([2, 3, 4, 5, 6])
    const bottom = pick([2, 3, 4, 5, 6, 7, 8, 9])
    const top = pick(Array.from({ length: bottom - 1 }, (_, index) => index + 1).filter((number) => gcd(number, bottom) === 1))
    const original = formatFraction(top * divisor, bottom * divisor)
    const correct = formatFraction(top, bottom)
    const wrongTop = top === 1 ? 2 : top - 1
    const wrong = formatFraction(wrongTop, bottom)
    return makeQuestion(topic, `Simplify ${original}`, [correct, wrong], correct, original)
  }

  if (topic === 'Decimals into fractions') {
    const scale = pick([10, 100])
    const numerator = pick(Array.from({ length: scale - 1 }, (_, index) => index + 1).filter((number) => gcd(number, scale) > 1 && number % 10 !== 0))
    const divisor = gcd(numerator, scale)
    const decimal = (numerator / scale).toString()
    const correct = formatFraction(numerator / divisor, scale / divisor)
    const wrong = formatFraction(numerator, scale)
    return makeQuestion(topic, `Write ${decimal} as a fraction in its simplest form.`, [correct, wrong], correct, decimal)
  }

  if (topic === 'Fraction & decimal conversions') {
    const pairs = [['1/2', '0.5'], ['1/5', '0.2'], ['1/10', '0.1'], ['1/4', '0.25'], ['3/4', '0.75'], ['2/5', '0.4'], ['3/5', '0.6'], ['7/10', '0.7'], ['1/20', '0.05']]
    const [fraction, decimal] = pick(pairs)
    const otherDecimals = pairs.map((pair) => pair[1]).filter((item) => item !== decimal)
    const wrong = pick(otherDecimals)
    return makeQuestion(topic, `Which decimal is equal to ${fraction}?`, [decimal, wrong], decimal, fraction)
  }

  if (topic === 'HCF in a fraction') {
    const factor = pick([2, 3, 4, 5, 6, 8])
    const basePairs = [[2, 3], [3, 4], [3, 5], [4, 5], [5, 6], [5, 7], [6, 7]]
    const [a, b] = pick(basePairs)
    const top = factor * a
    const bottom = factor * b
    const wrong = factor === 2 ? 3 : factor - 1
    return makeQuestion(topic, `What is the HCF of ${top} and ${bottom}?`, [String(factor), String(wrong)], String(factor), `${top}/${bottom}`)
  }

  const variable = pick(['x', 'y', 'a', 'm'])
  const first = pick([2, 3, 4, 5, 6, 7])
  const second = pick([2, 3, 4, 5])
  const add = Math.random() < 0.55
  const result = add ? first + second : first - second
  const sign = add ? '+' : '−'
  const correct = `${result}${variable}`
  const wrong = `${first * second}${variable}`
  return makeQuestion(topic, `Simplify: ${first}${variable} ${sign} ${second}${variable}`, [correct, wrong], correct, `${first}${variable}${sign}${second}${variable}`)
}

function makeQuestion(topic, prompt, answers, correct, signature) {
  return { topic, prompt, answers: shuffle(answers), correct, signature: `${topic}:${signature}` }
}

function nextQuestion(used) {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const question = generateQuestion(pick(TOPICS))
    if (!used.has(question.signature)) {
      used.add(question.signature)
      return question
    }
  }
  used.clear()
  return generateQuestion(pick(TOPICS))
}

function App() {
  const usedQuestions = useRef(new Set())
  const [question, setQuestion] = useState(() => generateQuestion(pick(TOPICS)))
  const [round, setRound] = useState(1)
  const [ropePosition, setRopePosition] = useState(0)
  const [scores, setScores] = useState({ left: 0, right: 0 })
  const [message, setMessage] = useState('First correct tap wins the pull!')
  const [locked, setLocked] = useState(false)
  const [pullsToWin, setPullsToWin] = useState(5)
  const [showSettings, setShowSettings] = useState(false)
  const [winner, setWinner] = useState(null)

  useEffect(() => {
    usedQuestions.current.add(question.signature)
  }, [question.signature])

  function chooseAnswer(team, answer) {
    if (locked || winner) return
    if (answer !== question.correct) {
      setMessage('Try again — only the first correct tap earns the pull!')
      return
    }
    const pull = team === 'left' ? -1 : 1
    const newPosition = ropePosition + pull
    setLocked(true)
    setRopePosition(newPosition)
    setScores((current) => ({ ...current, [team]: current[team] + 1 }))
    setMessage(`${team === 'left' ? 'Blue' : 'Orange'} team pulls the rope!`)
    window.setTimeout(() => {
      if (Math.abs(newPosition) >= pullsToWin) {
        setWinner(team)
        setMessage(`${team === 'left' ? 'Blue' : 'Orange'} team wins!`)
      } else {
        setQuestion(nextQuestion(usedQuestions.current))
        setRound((current) => current + 1)
        setMessage('First correct tap wins the pull!')
      }
      setLocked(false)
    }, 800)
  }

  function restart() {
    usedQuestions.current.clear()
    setQuestion(nextQuestion(usedQuestions.current))
    setRound(1)
    setRopePosition(0)
    setScores({ left: 0, right: 0 })
    setMessage('First correct tap wins the pull!')
    setLocked(false)
    setWinner(null)
  }

  function saveSettings(event) {
    event.preventDefault()
    setShowSettings(false)
    restart()
  }

  return <main className="game-shell">
    <header className="topbar">
      <div className="brand"><span aria-hidden="true">↔</span> Fraction, Decimal Tug of War</div>
      <div className="round">ROUND {round} <span>· MIXED PRACTICE</span></div>
      <div className="header-actions"><button className="restart" onClick={() => setShowSettings(true)}>⚙ Settings</button><button className="restart" onClick={restart}>↻ New game</button></div>
    </header>

    <section className="teams" aria-label="Team scores">
      <div className="team blue"><span>BLUE TEAM</span><strong>{scores.left}</strong></div>
      <div className="prompt"><p className="topic">{winner ? 'GAME COMPLETE' : question.topic}</p><p>{message}</p><h1>{winner ? `${winner === 'left' ? 'Blue' : 'Orange'} team wins!` : question.prompt}</h1></div>
      <div className="team orange"><span>ORANGE TEAM</span><strong>{scores.right}</strong></div>
    </section>

    {!winner ? <>
      <section className="answer-zone" aria-label="Choose the correct answer">
        <AnswerSide team="BLUE TEAM" side="left" question={question} onChoose={(answer) => chooseAnswer('left', answer)} disabled={locked} />
        <div className="versus" aria-hidden="true">VS</div>
        <AnswerSide team="ORANGE TEAM" side="right" question={question} onChoose={(answer) => chooseAnswer('right', answer)} disabled={locked} />
      </section>
      <Rope ropePosition={ropePosition} pullsToWin={pullsToWin} />
    </> : <section className="winner-card"><div className="trophy" aria-hidden="true">🏆</div><h2>{winner === 'left' ? 'Blue' : 'Orange'} team wins!</h2><p>They reached {pullsToWin} pulls first.</p><button onClick={restart}>Play again</button></section>}
    <footer>Mixed practice · First correct tap wins · First to {pullsToWin} pulls wins</footer>

    {showSettings && <div className="modal-backdrop" role="presentation"><form className="settings-card" onSubmit={saveSettings}><button type="button" className="close" onClick={() => setShowSettings(false)} aria-label="Close settings">×</button><p className="topic">GAME SETTINGS</p><h2>How long should the game last?</h2><label htmlFor="pulls">Pulls needed to win <strong>{pullsToWin}</strong></label><input id="pulls" type="range" min="2" max="10" value={pullsToWin} onChange={(event) => setPullsToWin(Number(event.target.value))} /><div className="range-labels"><span>Quick<br />2 pulls</span><span>Long<br />10 pulls</span></div><p className="settings-note">Changing this starts a fresh mixed-practice game. Every round is generated from all six topics.</p><button className="save-settings" type="submit">Save & start game</button></form></div>}
  </main>
}

function AnswerSide({ team, side, question, onChoose, disabled }) {
  return <div className={`answer-side ${side}-side`}><p>{team} — TOUCH AN ANSWER</p><div className="answers">{question.answers.map((answer) => <button className="answer" key={answer} onClick={() => onChoose(answer)} disabled={disabled}>{answer}</button>)}</div></div>
}

function Rope({ ropePosition, pullsToWin }) {
  const maxOffset = 37
  const offset = (ropePosition / pullsToWin) * maxOffset
  return <section className="rope-ground" aria-label="Tug of war rope"><div className="rope-track"><div className="center-line" /><div className="rope" style={{ transform: `translateX(${offset}vw)` }}><span className="flag">⚑</span></div></div><div className="pull-label left-pull">BLUE PULLS ←</div><div className="pull-label right-pull">→ ORANGE PULLS</div></section>
}

export default App
