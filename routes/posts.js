const router = require('express').Router();
const Post = require("../models/Post");

//CREATE

router.post("/", async (req, res) => {
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        res.status(500).json(err)
    }
})

//UPDATE

router.put("/:id", async (req, res) => {
    try {
        const post = Post.findById(req.params.id);
        if (post.userID === req.body.userID) {
            await post.updateOne({ $set: req.body });
            res.status(200).json("Your post has been updated successfully.")
        } else {
            res.status(403).json("You can only update your posts.")
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

//DELETE

router.delete("/:id", async (req, res) => {
    try {
        const post = Post.findById(req.params.id);
        if (post.userID === req.body.userID) {
            await post.deleteOne();
            res.status(200).json("Your post has been deleted successfully.")
        } else {
            res.status(403).json("You can only delete your posts.")
        }
    } catch (err) {
        res.status(500).json(err)
    }
});

//LIKE

router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("You liked the post!")
        } else {
            await post.updateOne({$pull: {likes:req.body.userId}});
            res.status(200).json("You no longer like the post!")
        }
    } catch (err) {
        res.status(500).json(err);
    }

});

//GET

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
});

//GET TIMELINE POSTS

router.get("/timeline/all", async (req, res) => {
    try{
        const currentUser = await User.findById(req.body.userId);
        const userPosts = await Post.find({userId: currentUser._id});
        const friendPosts = await Promise.all(
            currentUser.followings.map(friendId => {
                return Post.find({ userId: friendId});
            })
        );
        res.json(userPosts.concat(...friendPosts))
    }catch(err) {
        res.status(500).json(err)
    }
})


module.exports = router;