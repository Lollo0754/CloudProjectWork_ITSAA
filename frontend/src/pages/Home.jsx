import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-vh-100" style={{ background: '#f0f4f8' }}>
      <Navbar />

      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-1">Benvenuto nel portale</h2>
          <p className="text-muted">Seleziona un servizio per iniziare</p>
        </div>

        <div className="row justify-content-center g-4">

          {/* Tile 1 — Storia del Corso */}
          <div className="col-12 col-sm-6 col-lg-4">
            <div
              className="card h-100 border-0 shadow-sm text-center p-4"
              style={{ cursor: 'pointer', transition: 'transform .15s, box-shadow .15s' }}
              onClick={() => navigate('/timeline')}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="mb-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: 76, height: 76, background: '#e8f0fe' }}
                >
                  <i className="bi bi-clock-history" style={{ fontSize: '2.2rem', color: '#4285f4' }} />
                </div>
              </div>
              <h5 className="fw-bold mb-2">Storia del Corso</h5>
              <p className="text-muted small mb-3">
                Linea del tempo interattiva con le materie e le tecnologie scoperte ogni mese.
              </p>
              <span className="badge bg-primary bg-opacity-10 text-primary">
                <i className="bi bi-arrow-right me-1" />Apri
              </span>
            </div>
          </div>

          {/* Tile 2 — Gestione Emergenze */}
          <div className="col-12 col-sm-6 col-lg-4">
            <div
              className="card h-100 border-0 shadow-sm text-center p-4"
              style={{ transition: 'transform .15s, box-shadow .15s' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = ''
                e.currentTarget.style.boxShadow = ''
              }}
            >
              <div className="mb-3">
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center"
                  style={{ width: 76, height: 76, background: '#fce8e8' }}
                >
                  <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2.2rem', color: '#ea4335' }} />
                </div>
              </div>
              <h5 className="fw-bold mb-2">Gestione Emergenze</h5>
              <p className="text-muted small mb-3">
                Sistema di segnalazione e monitoraggio delle emergenze in tempo reale.
              </p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => navigate('/emergenze/operatore')}
                >
                  <i className="bi bi-phone me-1" />Operatore
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => navigate('/emergenze/centrale')}
                >
                  <i className="bi bi-display me-1" />Centrale
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
