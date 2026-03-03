const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const todosRouter = require('./routes/todos');


const PORT = process.env.PORT || 5000;
// 기본 DB를 test가 아닌 todo로 사용
// 환경변수 이름은 mongo_uri 또는 MONGODB_URI 둘 다 지원
const MONGODB_URI =
  process.env.mongo_uri ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/todo';

const app = express();

// CORS 설정: 프런트엔드(origin)를 명시적으로 허용
// - 로컬 개발: http://localhost:5173
// - 배포 프론트: https://vibe-todo-frontend-fawn.vercel.app
const allowedOrigins = [
  'http://localhost:5173',
  'https://vibe-todo-frontend-fawn.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // 개발용: origin이 없을 때(null, Postman 등)도 허용
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
  })
);

// JSON 파서
app.use(express.json());

// 헬스체크 / 기본 응답
app.get('/', (req, res) => {
  res.json({
    message: 'Todo Backend API',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// /api/todos 라우터 마운트
app.use('/api/todos', todosRouter);

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('연결 성공');
    app.listen(PORT, () => {
      console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    });
  } catch (err) {
    console.error('MongoDB 연결 실패:', err.message);
    process.exit(1);
  }
}

start();
