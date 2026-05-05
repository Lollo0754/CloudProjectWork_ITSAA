import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import Navbar from '../../components/Navbar'
import api from '../../api'

const STATO_CONFIG = {
  aperta:    { label: 'Aperta',     color: '#dc3545', variant: 'danger' },
  in_carico: { label: 'In carico',  color: '#0d6efd', variant: 'primary' },
  annullata: { label: 'Annullata',  color: '#6c757d', variant: 'secondary' },
  chiusa:    { label: 'Chiusa',     color: '#198754', variant: 'success' },
}

export default function Centrale() {
  const navigate = useNavigate()
  const [segnalazioni, setSegnalazioni] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [segsRes, statsRes] = await Promise.all([
      api.get('/emergenze/'),
      api.get('/emergenze/stats'),
    ])
    setSegnalazioni(segsRes.data)
    setStats(statsRes.data)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()

    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${proto}//${window.location.host}/api/emergenze/ws`)
    ws.onmessage = () => fetchData()
    return () => ws.close()
  }, [fetchData])

  async function changeStato(id, stato) {
    await api.patch(`/emergenze/${id}`, { stato })
    fetchData()
  }

  const active = segnalazioni.filter(s => s.stato !== 'chiusa' && s.stato !== 'annullata')
  const mapCenter = active.length > 0
    ? [active[0].latitudine, active[0].longitudine]
    : [41.9028, 12.4964]
  const statoColor = s => STATO_CONFIG[s]?.color ?? '#6c757d'

  if (loading) {
    return (
      <div className="min-vh-100" style={{ background: '#f0f4f8' }}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
          <div className="spinner-border text-danger" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ background: '#f0f4f8' }}>
      <Navbar />
      <div className="container-fluid py-4 px-4">

        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left me-1" />Home
          </button>
          <div>
            <h4 className="fw-bold mb-0">Centrale Operativa</h4>
            <p className="text-muted small mb-0">Monitoraggio emergenze in tempo reale</p>
          </div>
          <button className="btn btn-outline-primary btn-sm ms-auto" onClick={fetchData}>
            <i className="bi bi-arrow-clockwise me-1" />Aggiorna
          </button>
        </div>

        {/* Statistiche */}
        {stats && (
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm text-center p-3">
                <div className="fw-bold text-danger" style={{ fontSize: '2rem' }}>{stats.aperte}</div>
                <div className="small text-muted">Aperte</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm text-center p-3">
                <div className="fw-bold text-primary" style={{ fontSize: '2rem' }}>{stats.in_carico}</div>
                <div className="small text-muted">In Carico</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm text-center p-3">
                <div className="fw-bold text-success" style={{ fontSize: '2rem' }}>{stats.chiuse}</div>
                <div className="small text-muted">Chiuse</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card border-0 shadow-sm text-center p-3">
                <div className="fw-bold text-secondary" style={{ fontSize: '2rem' }}>
                  {stats.durata_media_minuti != null ? `${Math.round(stats.durata_media_minuti)}m` : '—'}
                </div>
                <div className="small text-muted">Durata Media</div>
              </div>
            </div>
          </div>
        )}

        <div className="row g-3">

          {/* Mappa */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 fw-semibold">
                <i className="bi bi-map me-2 text-primary" />Mappa Emergenze
                <span className="badge bg-danger ms-2">{active.length} attive</span>
                <span className="ms-3 small text-muted fw-normal">
                  <span className="me-2">🔴 aperta</span>
                  <span>🔵 in carico</span>
                </span>
              </div>
              <div className="card-body p-0">
                <MapContainer
                  center={mapCenter}
                  zoom={6}
                  style={{ height: '420px', width: '100%', borderRadius: '0 0 8px 8px' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="© OpenStreetMap contributors"
                  />
                  {active.map(s => (
                    <CircleMarker
                      key={`${s.id}-${s.stato}`}
                      center={[s.latitudine, s.longitudine]}
                      radius={10}
                      fillColor={statoColor(s.stato)}
                      color="white"
                      weight={2}
                      fillOpacity={0.85}
                    >
                      <Popup>
                        <strong>#{s.id} — {s.tipo}</strong><br />
                        {s.descrizione}<br />
                        <span style={{ color: statoColor(s.stato) }}>
                          ● {STATO_CONFIG[s.stato]?.label ?? s.stato}
                        </span><br />
                        <small className="text-muted">
                          {new Date(s.created_at).toLocaleString('it-IT')}
                        </small>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Lista segnalazioni */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 fw-semibold">
                <i className="bi bi-list-ul me-2 text-primary" />Segnalazioni
                <span className="badge bg-secondary bg-opacity-25 text-secondary ms-2">{segnalazioni.length}</span>
              </div>
              <div className="card-body p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                {segnalazioni.length === 0 && (
                  <p className="text-center text-muted py-5 mb-0">
                    <i className="bi bi-inbox d-block mb-2" style={{ fontSize: '2rem' }} />
                    Nessuna segnalazione
                  </p>
                )}
                {segnalazioni.map(s => (
                  <div key={s.id} className="border-bottom px-3 py-2">
                    <div className="d-flex align-items-start gap-2">
                      <div
                        style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: statoColor(s.stato),
                          marginTop: 5, flexShrink: 0,
                        }}
                      />
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-secondary bg-opacity-10 text-secondary small">
                            {s.tipo}
                          </span>
                          <span className="text-muted small">#{s.id}</span>
                        </div>
                        <p className="mb-1 small text-truncate" title={s.descrizione}>
                          {s.descrizione}
                        </p>
                        <p className="mb-0 text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(s.created_at).toLocaleString('it-IT')}
                        </p>
                      </div>
                      <div className="d-flex flex-wrap gap-1 align-self-center" style={{ flexShrink: 0 }}>
                        {Object.entries(STATO_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            className={`btn btn-sm btn-${s.stato === key ? cfg.variant : `outline-${cfg.variant}`}`}
                            disabled={s.stato === key}
                            onClick={() => changeStato(s.id, key)}
                          >
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
