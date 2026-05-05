import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents, useMap } from 'react-leaflet'
import Navbar from '../../components/Navbar'
import api from '../../api'

const TIPI = ['incidente', 'terremoto', 'incendio', 'alluvione', 'altro']
const ITALY_CENTER = [42.5, 12.5]

// Gestisce il click sulla mappa per selezionare la posizione
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// Vola alla posizione quando arriva un nuovo target GPS (oggetto nuovo = nuovo riferimento)
function MapController({ gpsTarget }) {
  const map = useMap()
  useEffect(() => {
    if (gpsTarget) map.flyTo([gpsTarget.lat, gpsTarget.lng], 14)
  }, [gpsTarget])
  return null
}

export default function Operatore() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ tipo: 'incidente', descrizione: '', latitudine: '', longitudine: '' })
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [gpsTarget, setGpsTarget] = useState(null)

  const lat = parseFloat(form.latitudine)
  const lng = parseFloat(form.longitudine)
  const hasPosition = form.latitudine !== '' && form.longitudine !== '' && !isNaN(lat) && !isNaN(lng)

  function handleMapClick(lat, lng) {
    setForm(f => ({
      ...f,
      latitudine: lat.toFixed(6),
      longitudine: lng.toFixed(6),
    }))
  }

  function getLocation() {
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        const la = pos.coords.latitude
        const lo = pos.coords.longitude
        setForm(f => ({
          ...f,
          latitudine: la.toFixed(6),
          longitudine: lo.toFixed(6),
        }))
        setGpsTarget({ lat: la, lng: lo })
        setLocating(false)
      },
      () => {
        setError('Impossibile ottenere la posizione GPS. Clicca sulla mappa.')
        setLocating(false)
      }
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/emergenze/', {
        tipo: form.tipo,
        descrizione: form.descrizione,
        latitudine: lat,
        longitudine: lng,
      })
      setSuccess(true)
      setForm({ tipo: 'incidente', descrizione: '', latitudine: '', longitudine: '' })
      setGpsTarget(null)
    } catch {
      setError("Errore durante l'invio della segnalazione.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100" style={{ background: '#f0f4f8' }}>
      <Navbar />
      <div className="container py-4" style={{ maxWidth: '620px' }}>

        <div className="d-flex align-items-center mb-4">
          <button className="btn btn-outline-secondary btn-sm me-3" onClick={() => navigate('/')}>
            <i className="bi bi-arrow-left me-1" />Home
          </button>
          <div>
            <h4 className="fw-bold mb-0 text-danger">
              <i className="bi bi-exclamation-triangle-fill me-2" />Nuova Segnalazione
            </h4>
            <p className="text-muted small mb-0">Vista operatore</p>
          </div>
        </div>

        {success && (
          <div className="alert alert-success d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill" />
            Segnalazione inviata con successo!
            <button className="btn btn-sm btn-success ms-auto" onClick={() => setSuccess(false)}>
              Nuova
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger small d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill" />{error}
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Tipo di emergenza</label>
                <select
                  className="form-select"
                  value={form.tipo}
                  onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                >
                  {TIPI.map(t => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small">Descrizione</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Descrivi l'emergenza in dettaglio..."
                  value={form.descrizione}
                  onChange={e => setForm(f => ({ ...f, descrizione: e.target.value }))}
                  required
                />
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <label className="form-label fw-semibold small mb-0">Posizione</label>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={getLocation}
                    disabled={locating}
                  >
                    {locating
                      ? <><span className="spinner-border spinner-border-sm me-1" />GPS...</>
                      : <><i className="bi bi-geo-alt-fill me-1" />Usa GPS</>
                    }
                  </button>
                </div>

                {/* Mappa cliccabile */}
                <div
                  className="rounded overflow-hidden border mb-2"
                  style={{ height: '260px', cursor: 'crosshair' }}
                >
                  <MapContainer
                    center={ITALY_CENTER}
                    zoom={6}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="© OpenStreetMap contributors"
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <MapController gpsTarget={gpsTarget} />
                    {hasPosition && (
                      <CircleMarker
                        center={[lat, lng]}
                        radius={12}
                        fillColor="#dc3545"
                        color="white"
                        weight={3}
                        fillOpacity={0.9}
                      >
                        <Popup>
                          <strong>Posizione selezionata</strong><br />
                          {lat.toFixed(5)}, {lng.toFixed(5)}
                        </Popup>
                      </CircleMarker>
                    )}
                  </MapContainer>
                </div>

                <p className="text-muted mb-2" style={{ fontSize: '0.78rem' }}>
                  <i className="bi bi-hand-index-thumb me-1" />
                  Clicca sulla mappa per posizionare il marcatore, oppure inserisci le coordinate manualmente.
                </p>

                {/* Input coordinate manuali */}
                <div className="row g-2">
                  <div className="col-6">
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm"
                      placeholder="Latitudine"
                      value={form.latitudine}
                      onChange={e => setForm(f => ({ ...f, latitudine: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm"
                      placeholder="Longitudine"
                      value={form.longitudine}
                      onChange={e => setForm(f => ({ ...f, longitudine: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-danger w-100" disabled={loading || !hasPosition}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Invio in corso...</>
                  : <><i className="bi bi-send-fill me-1" />Invia Segnalazione</>
                }
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
