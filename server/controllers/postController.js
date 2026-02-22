import fs from 'fs';
import imageKit from '../configs/imageKit.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

//Add post
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { content, post_type } = req.body;
        const images = req.files;

        let image_urls = [];

        if (images && images.length > 0) {
            image_urls = await Promise.all(
                images.map(async (image) => {
                    const fileBuffer = fs.readFileSync(image.path);

                    const response = await imageKit.upload({
                        file: fileBuffer,
                        fileName: image.originalname,
                        folder: 'posts'
                    });

                    return imageKit.url({
                        path: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: '1280' }
                        ]
                    });
                })
            );
        }

        await Post.create({
            user: userId,
            content,
            image_url: image_urls,
            post_type
        });

        res.json({ message: 'Post created successfully', success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

// get posts
export const getFeedPosts = async (req, res) => {
    try{
        const {userId} = req.auth();
        const user = await User.findById(userId);
        // user connections and following
        const userIds = [userId, ...user.connections, ...user.following];
        const posts = await Post.find({user: {$in: userIds}}).sort({createdAt: -1}).populate('user');
        res.json({posts, success: true})

    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal server error', success: false})
    }
}

// like post
export const likePost = async (req, res) => {
    try{
        const {userId} = req.auth();
        const {postId} = req.params;
        const post = await Post.findById(postId);
        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user => user !== userId);
            await post.save();
            res.json({message: 'Post unliked', success: true})
        }else{
            post.likes_count.push(userId);
            await post.save();
            res.json({message: 'Post liked', success: true})
        }
        

    }                           catch(error){
        console.error(error);
        res.status(500).json({message: 'Internal server error', success: false})
    }
}