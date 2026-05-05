import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const form = new URLSearchParams()
      form.append('username', username)
      form.append('password', password)
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.access_token)
      localStorage.setItem('ruolo', res.data.ruolo)
      localStorage.setItem('username', res.data.username)
      navigate('/')
    } catch {
      setError('Credenziali non valide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#f0f4f8' }}>
      <div className="card shadow-sm border-0 p-4" style={{ width: '360px' }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 mb-3" style={{ width: 64, height: 64 }}>
            <i className="bi bi-cloud-fill text-primary" style={{ fontSize: '1.8rem' }} />
          </div>
          <h5 className="fw-bold mb-1">Cloud AWS Project</h5>
          <p className="text-muted small mb-0">Accedi al portale</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-circle-fill" />{error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Username</label>
            <input
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-100" disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Accesso in corso...</>
              : <><i className="bi bi-box-arrow-in-right me-2" />Accedi</>
            }
          </button>
        </form>
      </div>
    </div>
  )
}
