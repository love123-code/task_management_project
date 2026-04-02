const express = require('express');
const router = express.Router();
const { 
  getBoards, 
  createBoard, 
  getBoard, 
  updateBoard, 
  deleteBoard, 
  joinBoard,
  createList,
  updateList,
  deleteList,
  reorderLists,
  createTask,
  updateTask,
  deleteTask,
  moveTask
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getBoards)
  .post(createBoard);

router.post('/join', joinBoard);

router.route('/:id')
  .get(getBoard)
  .put(updateBoard)
  .delete(deleteBoard);

router.route('/:boardId/lists')
  .post(createList);

router.route('/:boardId/lists/reorder')
  .put(reorderLists);

router.route('/:boardId/lists/:listId')
  .put(updateList)
  .delete(deleteList);

router.route('/:boardId/lists/:listId/tasks')
  .post(createTask);

router.route('/:boardId/lists/:listId/tasks/:taskId')
  .put(updateTask)
  .delete(deleteTask);

router.put('/:boardId/tasks/move', moveTask);

module.exports = router;
