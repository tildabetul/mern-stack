const mongoose = require('mongoose');
const Schema = require("mongoose/lib/schema");

const PostSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    avatar: {   //In order to keep post even user is deleted
        type: String
    },
    likes: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            }
        }
    ],
    comments: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users'
            },
            text: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            avatar: {
                type: String
            },
            date: {
                type: String,
                default: Date.now
            }
        }
    ],
    date: {
        type: String,
        default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);