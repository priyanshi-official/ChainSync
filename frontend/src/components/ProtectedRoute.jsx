import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ allowedRole }) {
  const token = localStorage.getItem('chainsync-token')
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('chainsync-user') || 'null')
  } catch {
    user = null
  }

  if (!token || !user || !user.role) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    const validRoles = ['manufacturer', 'supplier', 'distributor']
    return <Navigate to={validRoles.includes(user.role) ? `/${user.role}` : '/login'} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
