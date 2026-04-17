import { useState } from 'react'

const BASE_URL = "https://task-management-project-7wls.onrender.com"

function CreateBoardModal({ onClose, onSuccess }) {
  const [name, setName] = useState('Task Board')
  const [type, setType] = useState('solo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      // ✅ FIXED LINE (IMPORTANT)
      const res = await fetch(`${BASE_URL}/api/boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, type })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        onSuccess(data)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Server is waking up, please wait...')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Board</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Board Name</label>
            <input
              type="text"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter board name"
            />
          </div>

          <div className="input-group">
            <label>Board Type</label>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '12px 16px',
                backgroundColor: type === 'solo' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                borderRadius: '8px',
                flex: 1
              }}>
                <input
                  type="radio"
                  name="type"
                  value="solo"
                  checked={type === 'solo'}
                  onChange={(e) => setType(e.target.value)}
                  style={{ display: 'none' }}
                />
                <span>Solo</span>
              </label>
              
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                cursor: 'pointer',
                padding: '12px 16px',
                backgroundColor: type === 'collaborative' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                borderRadius: '8px',
                flex: 1
              }}>
                <input
                  type="radio"
                  name="type"
                  value="collaborative"
                  checked={type === 'collaborative'}
                  onChange={(e) => setType(e.target.value)}
                  style={{ display: 'none' }}
                />
                <span>Collaborative</span>
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateBoardModal