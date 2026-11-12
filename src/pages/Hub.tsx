import { Link } from 'react-router-dom'
import { games } from '../games'
import styles from './Hub.module.css'

export default function Hub() {
  return (
    <section className={`page ${styles.wrap}`}>
      <div className={styles.intro}>
        <span className="t-label t-muted">Playground</span>
        <h1 className="t-h1">Games</h1>
        <p className="t-body-lg t-muted">Small puzzles I built to keep my brain busy. Pick one.</p>
      </div>
      <div className={styles.grid}>
        {games.map((g) => (
          <Link key={g.id} to={`/${g.id}`} className={styles.card}>
            <div className={styles.icon}>
              <img src={g.icon} alt="" />
            </div>
            <h2 className="t-h3">{g.title}</h2>
            <p className="t-body-sm t-muted">{g.summary}</p>
            <div className={styles.tags}>
              {g.tags.map((t) => (
                <span key={t} className={styles.tag}>
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
