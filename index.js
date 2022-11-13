import express from 'express';
import mongoose from "mongoose";
import {PostController, UserController} from './controlers/index.js'
import cors from "cors";
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import auth from "./middleware/auth.js";

dotenv.config()

const CONNECTION_URL = 'mongodb+srv://vizantium:qwerty2002130814@cluster0.m4ph79g.mongodb.net/?retryWrites=true&w=majority'
const PORT = process.env.PORT;


mongoose
    .connect(process.env.CONNECTION_URL)
    .then(() => console.log('DB ok'))
    .catch((err) => console.log('DB error', err));

const app = express();

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

app.get('/posts', PostController.getPosts)
app.get('/posts/search', PostController.getPostsBySearch)
app.post('/posts', auth, PostController.createPost)
app.patch('/posts/:id', auth, PostController.updatePost)
app.delete('/posts/:id', auth, PostController.deletePost)
app.patch('/posts/:id/likePost', auth, PostController.likePost)
app.post('/posts/:id/commentPost', auth, PostController.commentPost)
app.post('/users/signin', UserController.signin)
app.post('/users/signup', UserController.signup)
app.get('/posts/:id', PostController.getPost)


app.listen(process.env.PORT || 4444, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('Server OK');
});






