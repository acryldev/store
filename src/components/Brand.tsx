import { Package } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Brand() {
  return (
    <Link className="brand" to="/" aria-label="DSH Store home">
      <span className="brand-mark"><Package aria-hidden="true" /></span>
      <span className="brand-word">DSH STORE</span>
    </Link>
  )
}
