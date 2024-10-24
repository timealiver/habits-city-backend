const express = require('express');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRouter.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const PORT = process.env.PORT || 5000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Habits-city auth-service API',
      version: '1.0.0',
      description: 'Простой сервис авторизации на Node.js',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
  },
  apis: ['./src/controllers/*.js'],
};

const specs = swaggerJSDoc(options);
const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://habits-city-frontend.vercel.app',
      'https://molsrg-habits-city-frontend-ab3a.twc1.net',
    ],
    credentials: true,
  }),
);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
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
