const Board = require('../models/Board');
const crypto = require('crypto');

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { creator: req.user._id },
        { collaborators: req.user._id }
      ]
    }).populate('creator', 'name email').sort({ updatedAt: -1 });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBoard = async (req, res) => {
  try {
    const { name, type } = req.body;
    let sharePassword = null;

    if (type === 'collaborative') {
      sharePassword = crypto.randomBytes(4).toString('hex');
    }

    const board = await Board.create({
      name: name || 'Task Board',
      type: type || 'solo',
      creator: req.user._id,
      sharePassword,
      lists: []
    });

    await board.populate('creator', 'name email');
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('collaborators', 'name email');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const hasAccess = 
      board.creator._id.toString() === req.user._id.toString() ||
      board.collaborators.some(c => c._id.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can update board' });
    }

    const { name } = req.body;
    if (name) board.name = name;

    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete board' });
    }

    await Board.findByIdAndDelete(req.params.id);
    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinBoard = async (req, res) => {
  try {
    const { boardId, sharePassword } = req.body;

    const board = await Board.findOne({
      _id: boardId,
      type: 'collaborative',
      sharePassword
    });

    if (!board) {
      return res.status(404).json({ message: 'Invalid board ID or password' });
    }

    if (board.creator.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You are the creator of this board' });
    }

    if (board.collaborators.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a collaborator' });
    }

    board.collaborators.push(req.user._id);
    await board.save();

    await board.populate('creator', 'name email');
    await board.populate('collaborators', 'name email');

    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createList = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const hasAccess = 
      board.creator.toString() === req.user._id.toString() ||
      board.collaborators.some(c => c.toString() === req.user._id.toString());

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name } = req.body;
    const position = board.lists.length;

    board.lists.push({ name, position, tasks: [] });
    await board.save();

    res.status(201).json(board.lists[board.lists.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateList = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const { name } = req.body;
    if (name) list.name = name;

    await board.save();
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteList = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    list.deleteOne();
    await board.save();
    res.json({ message: 'List deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const reorderLists = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const { listOrder } = req.body;
    const newLists = [];
    
    for (const listId of listOrder) {
      const list = board.lists.id(listId);
      if (list) newLists.push(list);
    }
    
    board.lists = newLists;
    await board.save();
    res.json(board.lists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const { title, description } = req.body;
    const position = list.tasks.length;

    list.tasks.push({ title, description, position });
    await board.save();

    res.status(201).json(list.tasks[list.tasks.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const task = list.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const { title, description } = req.body;
    if (title) task.title = title;
    if (description !== undefined) task.description = description;

    await board.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const task = list.tasks.id(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.deleteOne();
    await board.save();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const moveTask = async (req, res) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    const { sourceListId, destinationListId, sourceIndex, destinationIndex, taskId } = req.body;

    const sourceList = board.lists.id(sourceListId);
    const destList = board.lists.id(destinationListId);

    if (!sourceList || !destList) {
      return res.status(404).json({ message: 'List not found' });
    }

    const taskIndex = sourceList.tasks.findIndex(t => t._id.toString() === taskId);
    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const [task] = sourceList.tasks.splice(taskIndex, 1);
    destList.tasks.splice(destinationIndex, 0, task);

    await board.save();
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
