const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, '할일 내용을 입력해주세요.'],
      trim: true,
      maxlength: [200, '할일은 200자 이내로 입력해주세요.'],
    },
    importance: {
      type: Number,
      enum: [1, 2, 3], // 1: 낮음, 2: 보통, 3: 높음
      required: [true, '중요도(1-3)를 선택해주세요.'],
      default: 2,
    },
    estimatedTime: {
      type: Number, // 분 단위 예상 소요 시간
      default: 0,
      min: [0, '예상 소요 시간은 0분 이상이어야 합니다.'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      default: 0,
      min: [0, '미룬 횟수는 0 이상이어야 합니다.'],
    },
    aiComfortMessage: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Todo', todoSchema);
