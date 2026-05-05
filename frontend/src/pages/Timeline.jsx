import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import api from '../api'

export default function Timeline() {
  const [data, setData] = useState([])
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/timeline/')
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-vh-100" style={{ background: '#f0f4f8' }}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
          <div className="spinner-border text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{ background: '#f0f4f8' }}>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: '760px' }}>

        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left me-1" />Home
          </button>
          <div>
            <h4 className="fw-bold mb-0">Storia del Corso</h4>
            <p className="text-muted small mb-0">Percorso formativo mese per mese</p>
          </div>
        </div>

        <div className="position-relative" style={{ paddingLeft: '48px' }}>
          {/* Linea verticale */}
          <div style={{
            position: 'absolute',
            left: '19px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'linear-gradient(to bottom, #4285f4, #ea4335)',
            borderRadius: '2px',
          }} />

          {data.map((mese, i) => {
            const isHovered = hoveredIndex === i
            return (
              <div
                key={i}
                className="position-relative mb-3"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Nodo */}
                <div style={{
                  position: 'absolute',
                  left: '-29px',
                  top: '16px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isHovered ? '#ea4335' : '#4285f4',
                  border: '3px solid white',
                  boxShadow: `0 0 0 2px ${isHovered ? '#ea4335' : '#4285f4'}`,
                  transition: 'all .2s',
                  transform: isHovered ? 'scale(1.3)' : 'scale(1)',
                  zIndex: 1,
                }} />

                {/* Card */}
                <div
                  className="card border-0"
                  style={{
                    boxShadow: isHovered
                      ? '0 6px 20px rgba(66,133,244,.2)'
                      : '0 1px 6px rgba(0,0,0,.08)',
                    transition: 'box-shadow .2s',
                    cursor: 'default',
                  }}
                >
                  <div className="card-body py-3 px-4">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <i className="bi bi-calendar3 text-primary" />
                      <h6 className="fw-bold mb-0 text-primary">{mese.mese}</h6>
                    </div>

                    {isHovered ? (
                      <div className="row g-3 mt-1">
                        {mese.materie?.length > 0 && (
                          <div className="col-12 col-md-6">
                            <p className="small fw-semibold text-muted mb-2">
                              <i className="bi bi-book me-1" />Materie
                            </p>
                            <div className="d-flex flex-wrap gap-1">
                              {mese.materie.map((m, j) => (
                                <span key={j} className="badge rounded-pill bg-primary bg-opacity-10 text-primary">{m}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {mese.tecnologie?.length > 0 && (
                          <div className="col-12 col-md-6">
                            <p className="small fw-semibold text-muted mb-2">
                              <i className="bi bi-cpu me-1" />Tecnologie
                            </p>
                            <div className="d-flex flex-wrap gap-1">
                              {mese.tecnologie.map((t, j) => (
                                <span key={j} className="badge rounded-pill bg-success bg-opacity-10 text-success">{t}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted small mb-0">
                        {mese.materie?.length || 0} materie · {mese.tecnologie?.length || 0} tecnologie
                        <span className="ms-2 text-primary" style={{ fontSize: '0.75rem' }}>
                          <i className="bi bi-cursor me-1" />Passa il mouse per i dettagli
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
