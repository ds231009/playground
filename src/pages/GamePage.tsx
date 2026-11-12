import { Suspense } from 'react'
import { Link, useParams } from 'react-router-dom'
import { games } from '../games'
import NotFound from './NotFound'
import styles from './GamePage.module.css'

export default function GamePage() {
  const { game } = useParams()
  const entry = games.find((g) => g.id === game)
  if (!entry) return <NotFound />
  const Game = entry.component

  return (
    <section className={`page ${styles.wrap}`}>
      <Link to="/" className={`t-body-sm ${styles.back}`}>
        ← All games
      </Link>
      <div className={styles.stage}>
        <Suspense fallback={<p className="t-body t-muted">Loading…</p>}>
          <Game />
        </Suspense>
      </div>
    </section>
  )
}
