import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page" style={{ paddingTop: 48 }}>
      <h1 className="t-h1">Not found</h1>
      <p className="t-body t-muted">
        That game doesn't exist (yet). <Link to="/">Back to all games</Link>
      </p>
    </section>
  )
}
