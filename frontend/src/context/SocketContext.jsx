import { createContext, useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connectedUsers, setConnectedUsers] = useState([])
  const currentBoardRef = useRef(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      const newSocket = io('http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('Socket connected')
      })

      newSocket.on('user-joined', (data) => {
        setConnectedUsers(data.users)
      })

      newSocket.on('user-left', (data) => {
        setConnectedUsers(data.users)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [])

  const joinBoard = (boardId) => {
    currentBoardRef.current = boardId
    if (socket) {
      socket.emit('join-board', boardId)
    }
  }

  const leaveBoard = (boardId) => {
    if (socket) {
      socket.emit('leave-board', boardId)
    }
    currentBoardRef.current = null
    setConnectedUsers([])
  }

  const emitBoardUpdate = (boardId, board) => {
    if (socket) {
      socket.emit('board-updated', { boardId, board })
    }
  }

  const emitListCreated = (boardId, list) => {
    if (socket) {
      socket.emit('list-created', { boardId, list })
    }
  }

  const emitListUpdated = (boardId, list) => {
    if (socket) {
      socket.emit('list-updated', { boardId, list })
    }
  }

  const emitListDeleted = (boardId, listId) => {
    if (socket) {
      socket.emit('list-deleted', { boardId, listId })
    }
  }

  const emitTaskCreated = (boardId, listId, task) => {
    if (socket) {
      socket.emit('task-created', { boardId, listId, task })
    }
  }

  const emitTaskUpdated = (boardId, listId, task) => {
    if (socket) {
      socket.emit('task-updated', { boardId, listId, task })
    }
  }

  const emitTaskDeleted = (boardId, listId, taskId) => {
    if (socket) {
      socket.emit('task-deleted', { boardId, listId, taskId })
    }
  }

  const emitTaskMoved = (boardId, data) => {
    if (socket) {
      socket.emit('task-moved', { boardId, ...data })
    }
  }

  return (
    <SocketContext.Provider value={{
      socket,
      connectedUsers,
      joinBoard,
      leaveBoard,
      emitBoardUpdate,
      emitListCreated,
      emitListUpdated,
      emitListDeleted,
      emitTaskCreated,
      emitTaskUpdated,
      emitTaskDeleted,
      emitTaskMoved
    }}>
      {children}
    </SocketContext.Provider>
  )
}
