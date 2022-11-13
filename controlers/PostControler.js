import PostMessage from "../models/PostModel.js";
import mongoose from "mongoose";

export const getPosts = async (req, res) => {
    const {page} = req.query
    try {
        const LIMIT = 8
        const startIndex = (Number(page) - 1) * LIMIT
        const total = await PostMessage.countDocuments({})

        const posts = await PostMessage.find().sort({ _id: -1 }).limit(LIMIT).skip(startIndex)

        res.json({data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)})
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
}

export const getPost = async (req, res) => {
    const {id} = req.params
    try {
        const post = await PostMessage.findById(id)

        res.json(post)
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
}

export const getPostsBySearch = async (req, res) => {
    const {searchQuery, tags} = req.query
    try {
        const title = new RegExp(searchQuery, 'i')

        const posts = await PostMessage.find({$or: [{title}, {tags: {$in: tags.split(',')} }] })

        res.json({data: posts})
    } catch (e) {
        res.status(404).json({ message: e.message })
    }
}

export const createPost = async (req, res) => {

    try {
        const doc = new PostMessage({...req.body, creator: req.userId, createdAt: new Date().toISOString() })
        const post = await doc.save()

        res.json(post)
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: 'failed to create post'})
    }
}

export const updatePost = async (req, res) => {
    const { id: _id } = req.params
    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('No post with that id')
    try {
        const post = req.body

        const updatedPost = await PostMessage.findByIdAndUpdate(_id, { ...post, _id }, { new: true })

        res.json(updatedPost)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'failed to update post'})
    }
}

export const deletePost = async (req, res) => {
    const { id } = req.params
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')
    try {
        await PostMessage.findByIdAndRemove(id)
        res.json({message: 'Post deleted successfully'})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'failed to delete post'})
    }
}

export const likePost = async (req, res) => {
    const { id } = req.params
    if (!req.userId) return res.json({ message: 'Unauthenticated' })
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('No post with that id')
    try {
        const post = await PostMessage.findById(id)

        const index = post.likes.findIndex((id) => id === String(req.userId))

        if( index === -1) {
            post.likes.push(req.userId)
        } else {
            post.likes = post.likes.filter((id) => id !== String(req.userId))
        }

        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true })

        res.json(updatedPost)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'failed to like post'})
    }
}

export const commentPost = async (req, res) => {
    const {id} = req.params
    const {finalComment} = req.body
    const post = await PostMessage.findById(id)
    try {
        post.comments.push(finalComment)
        const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {new: true})
        res.json(updatedPost)
    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'failed to create comment'})
    }
}