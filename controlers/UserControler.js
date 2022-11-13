import UserModel from "../models/UserModel.js";
import {buildCheckFunction} from "express-validator";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'
import userModel from "../models/UserModel.js";

export const signin = async (req, res) => {
    const {email, password} = req.body

    try {
        const existingUser = await UserModel.findOne({email})
        if (!existingUser) {
            return res.status(404).json({message: 'user does not exist'})
        }
        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
        if (!isPasswordCorrect) {
            return res.status(404).json({message: 'invalid credentials'})
        }
        const token = jwt.sign({email: existingUser.email, id: existingUser._id},
            'test', {expiresIn: '1h'})

        res.status(200).json({result: existingUser, token})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'failed to signin'})
    }
}

export const signup = async (req, res) => {
    const {email, password, confirmPassword, firstName, lastName} = req.body
    try {
        const existingUser = await UserModel.findOne({email})
        if (existingUser) {
            return res.status(404).json({message: 'user already exist'})
        }
        if (password !== confirmPassword) {
            return res.status(404).json({message: 'passwords dont match'})
        }
        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await userModel.create({email, password: hashedPassword, name: `${firstName} ${lastName}`})

        const token = jwt.sign({email: result.email, id: result._id},
            'test', {expiresIn: '1h'})

        res.status(200).json({result, token})
    } catch (e) {
        console.log(e)
        res.status(500).json({message: 'failed to signup'})
    }
}
