import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../hooks/useAuth'
import '../styles/Board.css'

const BASE_URL = "https://task-management-project-7wls.onrender.com"

function Board() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const socketContext = useSocket()
  
  const [board, setBoard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddList, setShowAddList] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [newTaskInputs, setNewTaskInputs] = useState({})

  useEffect(() => {
    fetchBoard()
  }, [id])

  useEffect(() => {
    if (socketContext.socket && board) {
      socketContext.joinBoard(id)

      socketContext.socket.on('board-updated', (updatedBoard) => {
        if (updatedBoard._id === id) {
          setBoard(updatedBoard)
        }
      })

      socketContext.socket.on('list-created', (list) => {
        setBoard(prev => ({
          ...prev,
          lists: [...prev.lists, list]
        }))
      })

      socketContext.socket.on('list-updated', ({ listId, list }) => {
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => l._id === listId ? { ...l, ...list } : l)
        }))
      })

      socketContext.socket.on('list-deleted', ({ listId }) => {
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.filter(l => l._id !== listId)
        }))
      })

      socketContext.socket.on('task-created', ({ listId, task }) => {
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => 
            l._id === listId ? { ...l, tasks: [...l.tasks, task] } : l
          )
        }))
      })

      socketContext.socket.on('task-updated', ({ listId, task }) => {
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => 
            l._id === listId ? { 
              ...l, 
              tasks: l.tasks.map(t => t._id === task._id ? task : t) 
            } : l
          )
        }))
      })

      socketContext.socket.on('task-deleted', ({ listId, taskId }) => {
        setBoard(prev => ({
          ...prev,
          lists: prev.lists.map(l => 
            l._id === listId ? { 
              ...l, 
              tasks: l.tasks.filter(t => t._id !== taskId) 
            } : l
          )
        }))
      })

      socketContext.socket.on('task-moved', ({ sourceListId, destinationListId, sourceIndex, destinationIndex, taskId }) => {
        setBoard(prev => {
          const newLists = [...prev.lists]
          const sourceList = newLists.find(l => l._id === sourceListId)
          const destList = newLists.find(l => l._id === destinationListId)
          
          if (sourceList && destList) {
            const [task] = sourceList.tasks.splice(sourceIndex, 1)
            destList.tasks.splice(destinationIndex, 0, task)
          }
          
          return { ...prev, lists: newLists }
        })
      })

      return () => {
        socketContext.leaveBoard(id)
        if (socketContext.socket) {
          socketContext.socket.off('board-updated')
          socketContext.socket.off('list-created')
          socketContext.socket.off('list-updated')
          socketContext.socket.off('list-deleted')
          socketContext.socket.off('task-created')
          socketContext.socket.off('task-updated')
          socketContext.socket.off('task-deleted')
          socketContext.socket.off('task-moved')
        }
      }
    }
  }, [socketContext.socket, board?._id, id])

  const fetchBoard = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/api/boards/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (res.status === 404 || res.status === 403) {
        navigate('/')
        return
      }
      
      const data = await res.json()
      setBoard(data)
    } catch (error) {
      console.error('Error fetching board:', error)
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateList = async (e) => {
    e.preventDefault()
    if (!newListName.trim()) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/api/boards/${id}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newListName })
      })
      
      const list = await res.json()
      
      if (res.ok) {
        socketContext.emitListCreated(id, list)
        setNewListName('')
        setShowAddList(false)
      }
    } catch (error) {
      console.error('Error creating list:', error)
    }
  }

  const handleDeleteList = async (listId) => {
    if (!confirm('Delete this list and all its tasks?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/api/boards/${id}/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      socketContext.emitListDeleted(id, listId)
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  const handleUpdateListName = async (listId, newName) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/api/boards/${id}/lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      })
      
      const list = await res.json()
      
      if (res.ok) {
        socketContext.emitListUpdated(id, list)
      }
    } catch (error) {
      console.error('Error updating list:', error)
    }
  }

  const handleAddTask = async (listId) => {
    const title = newTaskInputs[listId]?.trim()
    if (!title) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/api/boards/${id}/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      })
      
      const task = await res.json()
      
      if (res.ok) {
        socketContext.emitTaskCreated(id, listId, task)
        setNewTaskInputs({ ...newTaskInputs, [listId]: '' })
      }
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleDeleteTask = async (listId, taskId) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${BASE_URL}/api/boards/${id}/lists/${listId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      socketContext.emitTaskDeleted(id, listId, taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const onDragEnd = async (result) => {
    const { source, destination, type } = result

    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    if (type === 'task') {
      const sourceList = board.lists.find(l => l._id === source.droppableId)
      const destList = board.lists.find(l => l._id === destination.droppableId)
      const task = sourceList.tasks[source.index]

      const newLists = [...board.lists]
      const newSourceTasks = [...sourceList.tasks]
      newSourceTasks.splice(source.index, 1)
      newLists.find(l => l._id === source.droppableId).tasks = newSourceTasks

      if (source.droppableId === destination.droppableId) {
        newSourceTasks.splice(destination.index, 0, task)
        setBoard({ ...board, lists: newLists })
      } else {
        const newDestTasks = [...destList.tasks]
        newDestTasks.splice(destination.index, 0, task)
        newLists.find(l => l._id === destination.droppableId).tasks = newDestTasks
        setBoard({ ...board, lists: newLists })
      }

      try {
        const token = localStorage.getItem('token')
      const res =   await fetch(`${BASE_URL}/api/boards/${id}/tasks/move`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sourceListId: source.droppableId,
            destinationListId: destination.droppableId,
            sourceIndex: source.index,
            destinationIndex: destination.index,
            taskId: task._id
          })
        })
        
        socketContext.emitTaskMoved(id, {
          sourceListId: source.droppableId,
          destinationListId: destination.droppableId,
          sourceIndex: source.index,
          destinationIndex: destination.index,
          taskId: task._id
        })
      } catch (error) {
        console.error('Error moving task:', error)
        fetchBoard()
      }
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading-screen">Loading board...</div>
  }

  if (!board) {
    return <div className="loading-screen">Board not found</div>
  }

  return (
    <div className="board-page">
      <nav className="board-navbar">
        <div className="board-nav-left">
          <button className="board-back" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h1 className="board-title">{board.name}</h1>
        </div>
        <div className="board-nav-right">
          {board.collaborators && board.collaborators.length > 0 && (
            <div className="board-users">
              {[board.creator, ...board.collaborators].map((u, i) => (
                <div key={i} className="board-user-avatar" title={u.name}>
                  {u.name.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="lists-container">
          {board.lists.map((list) => (
            <div key={list._id} className="list-wrapper">
              <div className="list">
                <div className="list-header">
                  <input
                    className="list-name"
                    value={list.name}
                    onChange={(e) => handleUpdateListName(list._id, e.target.value)}
                    onBlur={(e) => handleUpdateListName(list._id, e.target.value)}
                  />
                  <div className="list-actions">
                    <button
                      className="list-action-btn delete"
                      onClick={() => handleDeleteList(list._id)}
                      title="Delete list"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <Droppable droppableId={list._id} type="task">
                  {(provided, snapshot) => (
                    <div
                      className="tasks-container"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {list.tasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <div className="task-title">{task.title}</div>
                              {task.description && (
                                <div className="task-description">{task.description}</div>
                              )}
                              <div className="task-meta">
                                {formatDate(task.createdAt)}
                              </div>
                              <button
                                className="task-delete"
                                onClick={() => handleDeleteTask(list._id, task._id)}
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                <div className="add-task-form">
                  <input
                    className="add-task-input"
                    placeholder="Add a task..."
                    value={newTaskInputs[list._id] || ''}
                    onChange={(e) => setNewTaskInputs({
                      ...newTaskInputs,
                      [list._id]: e.target.value
                    })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTask(list._id)
                      }
                    }}
                  />
                  <button
                    className="add-task-btn"
                    onClick={() => handleAddTask(list._id)}
                  >
                    + Add Task
                  </button>
                </div>
              </div>
            </div>
          ))}

          {showAddList ? (
            <div className="add-list-form">
              <form onSubmit={handleCreateList}>
                <input
                  type="text"
                  placeholder="Enter list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  autoFocus
                />
                <div className="add-list-actions">
                  <button type="submit" className="btn btn-primary btn-sm">
                    Add List
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setShowAddList(false)
                      setNewListName('')
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="add-list-card" onClick={() => setShowAddList(true)}>
              <span className="add-list-text">+ Add another list</span>
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  )
}

export default Board
