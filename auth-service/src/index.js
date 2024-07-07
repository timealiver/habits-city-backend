const express = require('express');
const mongoose = require('mongoose')
const authRouter=require('./routes/authRouter.js')
const PORT = process.env.PORT || 5000;

const app=express();
app.use("/auth",authRouter);
app.use(express.json())
const start = async () => {
try {
    await mongoose.connect(`mongodb+srv://timealive:qwerty123@habits-1.kykynam.mongodb.net/auth_roles?retryWrites=true&w=majority&appName=Habits-1`);
    app.listen(PORT,()=> console.log(`Server started on port ${PORT}`))
} catch (e) {
    console.log(e);
}
}
start();