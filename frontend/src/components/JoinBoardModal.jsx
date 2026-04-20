import { useState } from 'react'
import { API_BASE_URL } from '../config'

function JoinBoardModal({ onClose, onSuccess }) {
  const [boardId, setBoardId] = useState('')
  const [sharePassword, setSharePassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')

      // ✅ FIXED LINE
       const res = await fetch(`${API_BASE_URL}/api/boards/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          boardId: boardId.trim(),
          sharePassword: sharePassword.trim()
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        onSuccess(data)
      } else {
        if (data.message.includes('Invalid board ID')) {
          setError('Invalid board ID format. Make sure you copied the correct ID.')
        } else if (data.message.includes('Board ID is required')) {
          setError('Please enter a board ID')
        } else {
          setError(data.message)
        }
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
          <h2>Join Collaborative Board</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="error-text" style={{ marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Board ID</label>
            <input
              type="text"
              className="input-field"
              value={boardId}
              onChange={(e) => setBoardId(e.target.value)}
              placeholder="Enter the board ID"
              required
            />
          </div>

          <div className="input-group">
            <label>Share Password</label>
            <input
              type="text"
              className="input-field"
              value={sharePassword}
              onChange={(e) => setSharePassword(e.target.value)}
              placeholder="Enter the share password"
              required
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Joining...' : 'Join Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JoinBoardModal