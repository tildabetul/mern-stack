const express = require('express');
const request = require('request'); //to use external api such as github
const config = require('config');
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const router = express.Router();

const Profile = require("../../models/Profile")
const User = require("../../models/User")

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    Create or update user profile
// @access  Private
router.post('/', [auth, [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty(),
    ]],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {
            company, website, location, bio, status, githubusername,
            skills, youtube, linkedin
        } = req.body;

        // Build Profile object //TODO find smt similar to ModelMapper and improve the code below!
        const profileFields = {};
        profileFields.user = req.user.id;
        if (company) profileFields.company = company;
        if (website) profileFields.website = website;
        if (location) profileFields.location = location;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (bio) profileFields.githubusername = githubusername;
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube;
        if (linkedin) profileFields.social.linkedin = linkedin;

        try {

            console.log(profileFields);

            let profile = Profile.findOne({users: req.user.id});

            if (profile) {
                console.log(`Update user`)
                console.log(req.user.id)
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {returnNewDocument: true, upsert: true}
                );
                return res.json(profile);
            } else {
                console.log(`Create user`)
                profile = new Profile(profileFields);
                await profile.save();
                res.json(profile);
            }

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }

        res.send('dsghkd')


    });

// @route   GET api/profile
// @desc    Get all user profiles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']); // populate: bring name and avatar from user schema
        res.send(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']); // populate: bring name and avatar from user schema
        if (!profile) {
            return res.status(400).json({msg: 'There is no profile for this user id'});
        }
        res.send(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'There is no profile for this user id'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile
// @desc    Get profile, user & posts
// @access  Private
router.delete('/', auth, async (req, res) => {
    try {
        // TODO Remove posts of user, too
        // Remove profile
        await Profile.findOneAndRemove({user: req.user.id});
        // Remove user
        await User.findOneAndRemove({_id: req.user.id});
        res.send('Successfully deleted');
    } catch (err) {
        console.error({msg: err.message});
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add an experience to profile
// @access  Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {title, company, location, from, to, current, description} = req.body;

    const newExperience = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.experiences.unshift(newExperience); // Add the beginning
        await profile.save();

        res.send(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/experience
// @desc    Delete an experience to profile
// @access  Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        // Get remove index
        const removeIndex = profile.experiences
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        profile.experiences.splice(removeIndex, 1);

        await profile.save();

        res.send(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/profile/education
// @desc    Add an education to profile
// @access  Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('current', 'Current is required').not().isEmpty(),
]], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    const {school, degree, fieldofstudy, from, to, current, description} = req.body;

    const newEducation = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(newEducation); // Add the beginning
        await profile.save();

        res.send(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/education
// @desc    Delete an education to profile
// @access  Private
router.delete('/education/:education_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id});

        // Get remove index
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.education_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.send(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/github/username
// @desc    Get user repos from Github
// @access  Public
router.get('/github/:username', (req, res) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: {'user-agent': 'node-js'}
        }

        request(options, (error, response, body) => {
            if(error) console.error(error);

            if (response.statusCode !== 200) {
                return res.status(404).json({msg: 'No Github profile is found'});
            }

            res.json(JSON.parse(body));

        })

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;