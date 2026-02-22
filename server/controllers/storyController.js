import Story from "../models/Story.js";
import imagekit from "../configs/imageKit.js";
import fs from "fs";
import User from "../models/User.js";
import { inngest } from "../inngest/index.js";



//add user story
export const addUserStory = async (req, res) => {
    try{
        const { userId } = req.auth();
        const { content, media_type, background_color } = req.body;
        const media = req.file;
        
        let media_url = '';
        //upload media to imagekit
        if(media_type === 'image' || media_type === 'video'){
            const fileBuffer = fs.readFileSync(media.path);
            const response = await imagekit.upload({
                file: fileBuffer.toString('base64'),
                fileName: media.originalname,
            });
            media_url = response.url;
        }
        //create story
        const story = await Story.create({
            user:userId,
            content,
            media_url,
            media_type,
            background_color,
        })

        //schedule story deletion after 24 hours using inngest
        await inngest.send({
            name:'/app/story.delete',
            data:{ storyId: story._id }
        })
        res.status(201).json({ success: true, message: "Story added successfully", story });
    }catch(err){
        res.status(500).json({ success: false, message: err.message });
    }
}
//get user stories
export const getStories = async (req, res) => {
    try{
        const { userId } = req.auth();
        const user = await User.findById(userId);
        // user connections and following
        const userIds = [userId, ...user.connections, ...user.following];
        const stories = await Story.find({ user: { $in: userIds } }).populate('user').sort({ createdAt: -1 });
        res.json({ success: true, data: stories });
    }catch(err){
        res.status(500).json({ success: false, message: err.message });
    }
}