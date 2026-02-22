// Todo Backend Server
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

const todoRouter = require('./routers/todos');

// MongoDB 연결 설정 (비밀번호 특수문자 자동 URL 인코딩)
const MONGODB_URI = process.env.MONGO_URI || (process.env.MONGO_USER && process.env.MONGO_PASSWORD && process.env.MONGO_CLUSTER
  ? `mongodb+srv://${encodeURIComponent(process.env.MONGO_USER)}:${encodeURIComponent(process.env.MONGO_PASSWORD)}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB || ''}`
  : 'mongodb://localhost:27017/todo-backend');

// MongoDB 연결 (실패해도 서버는 계속 실행)
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
  })
  .catch((error) => {
    console.error('MongoDB 연결 실패 (서버는 계속 실행됩니다):', error.message);
  });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Todo Backend API is running!' });
});
app.use('/todos', todoRouter);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
