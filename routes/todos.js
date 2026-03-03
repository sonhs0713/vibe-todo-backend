const express = require('express');
const Todo = require('../models/Todo');
const { createCareMessage } = require('../services/aiCare');

const router = express.Router();

// 할일 생성 POST /api/todos
router.post('/', async (req, res) => {
  try {
    const {
      title,
      importance = 2,
      estimatedTime = 0,
      completed = false,
      count = 0,
      aiComfortMessage = '',
    } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({
        success: false,
        message: '할일 내용(title)을 입력해주세요.',
      });
    }

    const todo = await Todo.create({
      title: title.trim(),
      importance,
      estimatedTime,
      completed,
      count,
      aiComfortMessage,
    });

    res.status(201).json({
      success: true,
      data: todo,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 할일 전체 조회 GET /api/todos
router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: todos,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 할일 단건 조회 GET /api/todos/:id
router.get('/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.',
      });
    }
    res.json({
      success: true,
      data: todo,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 할일 수정 PUT /api/todos/:id
router.put('/:id', async (req, res) => {
  try {
    const updateFields = {};
    const allowedFields = [
      'title',
      'importance',
      'estimatedTime',
      'completed',
      'count',
      'aiComfortMessage',
    ];

    allowedFields.forEach((field) => {
      if (field in req.body) {
        updateFields[field] = req.body[field];
      }
    });

    if (updateFields.title && typeof updateFields.title === 'string') {
      updateFields.title = updateFields.title.trim();
    }

    const todo = await Todo.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: todo,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 할일 삭제 DELETE /api/todos/:id
router.delete('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({
        success: false,
        message: '할일을 찾을 수 없습니다.',
      });
    }
    res.json({
      success: true,
      message: '할일이 삭제되었습니다.',
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 완료되지 않은 할 일을 다음 날로 분산 배치하는 라우터
// 여기서는 '실패'라는 단어 대신 '재조정'이라는 표현을 사용해서
// 할 일을 다시 계획하고 조정하는 긍정적인 의미로 다룹니다.
router.post('/rearrange', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const incompleteTodos = await Todo.find({
      completed: false,
      createdAt: { $gte: today, $lt: tomorrow },
    }).sort({ importance: -1, createdAt: 1 });

    const updated = [];

    for (const todo of incompleteTodos) {
      // 재조정: 오늘 소화하지 못한 할 일을
      // 더 적절한 다음 날로 옮기면서 계획을 다시 세운다.
      todo.count += 1;
      todo.aiComfortMessage =
        (await createCareMessage({
          name: '민준',
          title: todo.title,
          count: todo.count,
        })) || todo.aiComfortMessage;
      const newDate = new Date(todo.createdAt);
      newDate.setDate(newDate.getDate() + 1);
      todo.createdAt = newDate;
      todo.updatedAt = new Date();
      await todo.save();
      updated.push(todo);
    }

    res.json({
      success: true,
      message: '완료되지 않은 할 일들이 다음 날로 재조정되었습니다.',
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: '재조정 처리 중 서버 오류가 발생했습니다.',
    });
  }
});

module.exports = router;
