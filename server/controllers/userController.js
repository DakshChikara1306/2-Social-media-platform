import { use } from "react";
import User from "../models/User.js";
import fs from 'fs';
import imagekit from "../configs/imageKit.js";


//get user data using user id
export const getUserData = async (req, res) => {
    try{
        const {userId} = await req.auth();
        const user = await User.findById(userId);
        if(!user){
            return res.json({message: "User not found", success: false});
        }
        res.json({message: "User data fetched successfully", success: true, data: user});
    }catch(err){
        console.log(err);
        res.json({message: err.message, success: false});
    }
}

//update user data using user id
export const updateUserData = async (req, res) => {
    try{
        const {userId} = await req.auth();
        const {username , bio , location , full_name} = req.body;
        const tempUser = await User.findById(userId);       
        !username &&(username = tempUser.username);
        if(tempUser.username !== username){
            const user = await User.findOne({username});
            if(user){
                username = tempUser.username;
            }
        }
        const updatedData = {
            username,
            bio,
            location,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0] 
        const cover = req.files.cover && req.files.cover[0]
        
        if(profile){
            const buffer = fs.readFileSync(profile.path);
            const response = await imagekit.upload({
                file : buffer,
                fileName : profile.originalname
            });
            const url = imagekit.url({
                src : response.url,
                transformation : [{
                    quality: 'auto'
                } ,
            {format: 'webp'} , {width:'512'}]
            });
            updatedData.profile_picture = url;
        }
        if(cover){
            const buffer = fs.readFileSync(cover.path);
            const response = await imagekit.upload({
                file : buffer,
                fileName : cover.originalname
            });
            const url = imagekit.url({
                src : response.url,
                transformation : [{
                    quality: 'auto'
                } ,
            {format: 'webp'} , {width:'1280'}]
            });
            updatedData.cover_photo = url;
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, {new: true});
        res.json({message: "User data updated successfully", success: true, data: user});   

        
    }catch(err){
        console.log(err);
        res.json({message: err.message, success: false});
    }
}   