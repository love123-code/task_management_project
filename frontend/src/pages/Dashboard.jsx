import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { API_BASE_URL } from '../config'
import CreateBoardModal from '../components/CreateBoardModal'
import JoinBoardModal from '../components/JoinBoardModal'
import ThemeToggle from '../components/ThemeToggle'
import '../styles/Dashboard.css'

function Dashboard() {
  const [boards, setBoards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [showShareInfo, setShowShareInfo] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBoards()
  }, [])

  const fetchBoards = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/api/boards`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setBoards(data)
    } catch (error) {
      console.error('Error fetching boards:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBoard = async (e, boardId) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this board?')) return

    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_BASE_URL}/api/boards/${boardId}`, {  
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setBoards(boards.filter(b => b._id !== boardId))
    } catch (error) {
      console.error('Error deleting board:', error)
    }
  }

  const copyShareInfo = (e, board) => {
    e.stopPropagation()
    const info = `Board ID: ${board._id}\nPassword: ${board.sharePassword}`
    navigator.clipboard.writeText(info)
    setShowShareInfo(board._id)
    setTimeout(() => setShowShareInfo(null), 2000)
  }

  const isCreator = (board) => {
    return board.creator._id === user._id
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-logo">Task<span>Flow</span></h1>
        <div className="dashboard-user">
          <span className="user-name">{user.name}</span>
          <div className="user-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <ThemeToggle />
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <h2 className="dashboard-title">Your Boards</h2>
        
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            + Create Board
          </button>
          <button className="btn btn-secondary" onClick={() => setShowJoinModal(true)}>
            Join Collaborative Board
          </button>
        </div>

        {loading ? (
          <div className="loading-screen">Loading boards...</div>
        ) : boards.length === 0 ? (
          <div className="empty-boards">
            <h3>No boards yet</h3>
            <p>Create your first board to get started!</p>
          </div>
        ) : (
          <div className="boards-grid">
            {boards.map(board => (
              <div
                key={board._id}
                className="board-card"
                onClick={() => navigate(`/board/${board._id}`)}
              >
                <div className="board-card-header">
                  <h3 className="board-name">{board.name}</h3>
                  {isCreator(board) && (
                    <button
                      className="board-delete"
                      onClick={(e) => handleDeleteBoard(e, board._id)}
                      title="Delete board"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <span className={`board-type ${board.type}`}>
                  {board.type}
                </span>
                <div className="board-options">
                  <div className="board-meta">
                    <span className="board-creator">
                      {isCreator(board) ? 'Created by you' : `By ${board.creator.name}`}
                    </span>
                  </div>
                  {board.type === 'collaborative' && isCreator(board) && (
                    <div 
                      className="share-info"
                      onClick={(e) => copyShareInfo(e, board)}
                    >
                      {showShareInfo === board._id ? 'Copied!' : 'Share Credentials'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(board) => {
            setBoards([board, ...boards])
            setShowCreateModal(false)
          }}
        />
      )}

      {showJoinModal && (
        <JoinBoardModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={(board) => {
            setBoards([board, ...boards])
            setShowJoinModal(false)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
