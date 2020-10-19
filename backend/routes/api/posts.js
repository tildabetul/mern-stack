const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const Profile = require("../../models/Profile")
const User = require("../../models/User")
const Post = require("../../models/Post")


// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty(),
]], async (req, res) => {
    //Error check for inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password')

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private
router.get('/', auth, async (req, res) => {

    try {
        const posts = await Post.find().sort({date: -1});

        res.send(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:post_id
// @desc    Get post by id
// @access  Private
router.get('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(404).json({msg: 'No post having this id'});
        }

        res.send(post);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'No post having this id'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:post_id
// @desc    Delete post by id
// @access  Private
router.delete('/:post_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(404).json({msg: 'No post having this id'});
        }

        // Check owner of the post
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({msg: 'The post is owned by another user'});
        }

        await post.remove();

        res.json({msg: 'Successfully deleted'});
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'No post having this id'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/:post_id/like //TODO warn posts/like/id is wrong
// @desc    Add like
// @access  Private
router.put('/:post_id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(404).json({msg: 'No post having this id'});
        }

        // Check whether the post is already liked by this user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({msg: 'The post is already liked by this user'});
        }

        post.likes.unshift({user: req.user.id});

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'No post having this id'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/:post_id/unlike
// @desc    Unlike
// @access  Private
router.put('/:post_id/unlike', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if (!post) {
            return res.status(404).json({msg: 'No post having this id'});
        }

        // Check whether the post is already liked by this user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({msg: 'The post has not yet been liked by this user.'});
        }

        let removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();

        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'No post having this id'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   POST api/posts/:post_id/comment
// @desc    Add comment to post
// @access  Private
router.post('/:post_id/comment', [auth, [
    check('text', 'Text is required').not().isEmpty(),
]], async (req, res) => {

    //Error check for inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const post = await Post.findById(req.params.post_id);
        if (!post) {
            return res.status(404).json({msg: 'No post having this id'});
        }

        const user = await User.findById(req.user.id).select('-password')

        const newComment = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        post.comments.unshift(newComment);

        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE api/posts/:post_id/comment/:comment_id
// @desc    Add comment to post
// @access  Private
router.delete('/:post_id/comment/:comment_id', auth, //TODO warn path
    async (req, res) => {

        try {
            // Get related post
            const post = await Post.findById(req.params.post_id);
            if (!post) {
                return res.status(404).json({msg: 'No post having this id'});
            }

            // Get related comment
            const comment = post.comments.find(comment => comment.id === req.params.comment_id);
            if (!comment) {
                return res.status(404).json({msg: 'No comment found with this id'});
            }

            // Check owner of comment before deletion
            if (comment.user.toString() !== req.user.id) {
                return res.status(401).json({msg: 'The comment is written by another user'});
            }

            // // TODO warn : videoda user ile sildi, comment id ile degil
            let indexOfComment = post.comments.map(comment => comment.id).indexOf(req.params.comment_id);

            post.comments.splice(indexOfComment, 1);

            await post.save();

            res.json(post.comments);
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    });

module.exports = router;