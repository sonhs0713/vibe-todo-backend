const express = require('express');
const Todo = require('../models/Todo');

const router = express.Router();

// Get All Todos (목록 조회)
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find();
    return res.status(200).json(todos);
  } catch (error) {
    return res.status(500).json({ message: '서버 오류', error: String(error?.message ?? error) });
  }
});

// Create Todo
router.post('/', async (req, res) => {
  try {
    const { title } = req.body ?? {};

    if (typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ message: 'title은 필수입니다.' });
    }

    const todo = await Todo.create({ title: title.trim() });
    return res.status(201).json(todo);
  } catch (error) {
    return res.status(500).json({ message: '서버 오류', error: String(error?.message ?? error) });
  }
});

// Update Todo
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body ?? {};

    const update = {};

    if (typeof title === 'string') {
      if (title.trim().length === 0) {
        return res.status(400).json({ message: 'title은 비어 있을 수 없습니다.' });
      }
      update.title = title.trim();
    }

    if (typeof completed === 'boolean') {
      update.completed = completed;
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: '수정할 필드가 없습니다.' });
    }

    const todo = await Todo.findByIdAndUpdate(id, update, { new: true });

    if (!todo) {
      return res.status(404).json({ message: 'Todo를 찾을 수 없습니다.' });
    }

    return res.status(200).json(todo);
  } catch (error) {
    return res.status(500).json({ message: '서버 오류', error: String(error?.message ?? error) });
  }
});

// Delete Todo (삭제)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await Todo.findByIdAndDelete(id);

    if (!todo) {
      return res.status(404).json({ message: 'Todo를 찾을 수 없습니다.' });
    }

    return res.status(200).json({ message: 'Todo가 삭제되었습니다.' });
  } catch (error) {
    return res.status(500).json({ message: '서버 오류', error: String(error?.message ?? error) });
  }
});

module.exports = router;

