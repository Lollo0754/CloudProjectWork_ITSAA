import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-dark bg-primary px-3 py-2">
      <Link className="navbar-brand fw-bold" to="/">
        <i className="bi bi-cloud-fill me-2" />
        Cloud AWS Project
      </Link>
      <div className="ms-auto d-flex align-items-center gap-3">
        <span className="text-white opacity-75 small">
          <i className="bi bi-person-circle me-1" />{username}
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={logout}>
          <i className="bi bi-box-arrow-right me-1" />Esci
        </button>
      </div>
    </nav>
  )
}
