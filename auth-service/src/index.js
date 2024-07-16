const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://habits-city-frontend-ozv8jn2ma-molsrgs-projects.vercel.app',
    ],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRouter);

const start = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://timealive:qwerty123@habits-1.kykynam.mongodb.net/auth_roles?retryWrites=true&w=majority&appName=Habits-1`,
    );
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
