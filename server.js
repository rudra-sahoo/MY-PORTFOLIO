require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const mongoose = require('mongoose');
const fetch = require('node-fetch');
const cron = require('node-cron');
const morgan = require('morgan');
const session = require('express-session');
const multer = require('multer');
const fsp = require('fs').promises; 
const fs = require('fs');
const app = express();
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log("Connected successfully to MongoDB");
});
// Define MongoDB Schema
const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    githubUrl: String,
    createdAt: { type: Date, default: Date.now },
    languages: { type: Map, of: String }
});

const Project = mongoose.model('Project', projectSchema);

// Define User Schema for user visited count and time spent
const userSchema = new mongoose.Schema({
    ipAddress: String,
    visitedCount: { type: Number, default: 1 },
    totalTimeSpent: { type: Number, default: 0 } // in seconds
});

const User = mongoose.model('User', userSchema);

const googleUserSchema = new mongoose.Schema({
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true },
    imageUrl: { type: String, required: true }
});
const GoogleUser = mongoose.model('GoogleUser', googleUserSchema);

const blogSchema = new mongoose.Schema({
    title: { type: String, unique: true, required: true },
    thumbnailData: String,  // Holds the Base64 encoded data
    content: String,
    authorSignature: {type:String, required: true},
    createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

const commentSchema = new mongoose.Schema({
    blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null }, // Reference to parent comment if it is a reply
    createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    next();
});
app.use('/uploads', express.static('uploads'));
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(morgan('dev'));  // Logging HTTP requests
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Adjust this based on your deployment environment
}));
app.use(express.json());
// Function to fetch languages from GitHub API
async function fetchLanguages(githubUrl) {
    const apiUrl = `https://api.github.com/repos/${githubUrl.split('github.com/')[1]}/languages`;
    const response = await fetch(apiUrl, {
        headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
    });
    const data = await response.json();

    const totalBytes = Object.values(data).reduce((total, bytes) => total + bytes, 0);
    return Object.fromEntries(
        Object.entries(data).map(([language, bytes]) => [language, ((bytes / totalBytes) * 100).toFixed(2)])
    );
}
// Get projects from MongoDB
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 }).limit(5);
        res.json(projects);
    } catch (error) {
        console.error('Failed to fetch projects', error);
        res.status(500).send({ success: false, message: 'Failed to fetch projects' });
    }
});
// Middleware to authenticate token

// Store project data in MongoDB
app.post('/api/projects', async (req, res) => {
    const { name, description, githubUrl } = req.body;
    if (!name || !description || !githubUrl) {
        return res.status(400).send({ success: false, message: "Invalid project data provided." });
    }

    try {
        const languages = await fetchLanguages(githubUrl);
        const newProject = new Project({ name, description, githubUrl, languages });
        await newProject.save();
        res.send({ success: true, message: "Project saved successfully" });
    } catch (error) {
        console.error('Failed to save project', error);
        res.status(500).send({ success: false, message: 'Failed to save project' });
    }
});

// Get user visit data and time spent data
app.get('/api/user-stats', async (req, res) => {
    try {
        const users = await User.find();
        let visitedCount = 0;
        let totalTimeSpent = 0;

        users.forEach(user => {
            visitedCount += user.visitedCount;
            totalTimeSpent += user.totalTimeSpent;
        });

        res.json({ visitedCount, totalTimeSpent });
    } catch (error) {
        console.error('Failed to fetch user stats', error);
        res.status(500).send({ success: false, message: 'Failed to fetch user stats' });
    }
});

// Scheduled task to update projects every 24 hours
cron.schedule('0 0 * * *', async () => {
    try {
        const response = await fetch('https://api.github.com/users/rudra-sahoo/repos?sort=created', {
            headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }
        });
        const data = await response.json();
        await Promise.all(data.map(async project => {
            const languages = await fetchLanguages(project.html_url);
            return Project.findOneAndUpdate(
                { githubUrl: project.html_url },
                {
                    name: project.name,
                    description: project.description || 'No description',
                    githubUrl: project.html_url,
                    createdAt: new Date(project.created_at),
                    languages
                },
                { upsert: true, new: true }
            );
        }));
        console.log('Projects updated');
    } catch (error) {
        console.error('Failed to fetch and update projects from GitHub', error);
    }
}, {
    scheduled: true,
    timezone: "UTC"
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USERNAME, pass: process.env.EMAIL_PASSWORD }
});

app.post('/api/send-email', async (req, res) => {
    const { name, email, subject, message } = req.body;
    try {
        await transporter.sendMail({
            from: 'rudra.workwith@gmail.com',
            to: 'rudra.workwith@gmail.com',
            subject: `${subject}`,
            text: `${name} with ${email} sent you a message: ${message}`
        });

        await transporter.sendMail({
            from: 'rudra.workwith@gmail.com',
            to: email,
            subject: "Thank you for contacting us!",
            text: "We have received your message and will get back to you shortly."
        });

        res.send({ success: true, message: "Email sent successfully" });
    } catch (error) {
        console.error('Failed to send email', error);
        res.status(500).send({ success: false, message: 'Failed to send email' });
    }
});
app.post('/api/blog', upload.single('thumbnail'), async (req, res) => {
    const { title, content, authorSignature } = req.body;
    let thumbnailData = null;

    if (req.file) {
        const filePath = req.file.path;
        try {
            // Read the file asynchronously using fs.promises
            const fileBuffer = await fsp.readFile(filePath);
            const mimeType = req.file.mimetype;
            thumbnailData = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;

            // Once the file has been processed, asynchronously remove it
            await fsp.unlink(filePath);
        } catch (error) {
            console.error('File processing error:', error);
            // Ensure that file removal is attempted even if reading fails
            try {
                await fsp.unlink(filePath);
            } catch (unlinkError) {
                console.error('Error removing file:', unlinkError);
            }
            return res.status(500).send({ success: false, message: 'Failed to process thumbnail image' });
        }
    }

    try {
        // Create a new blog post with the provided data
        const newBlog = new Blog({
            title, 
            content, 
            authorSignature,
            thumbnailData  // Save Base64-encoded image data
        });
        await newBlog.save();  // Save the blog post to the database
        res.send({ success: true, message: "Blog posted successfully", blogId: newBlog._id });
    } catch (error) {
        console.error('Failed to save blog:', error);
        res.status(500).send({ success: false, message: 'Failed to save blog' });
    }
});
app.get('/api/blogs', async (req, res) => {
    try {
        // Fetch all blogs from the database
        const blogs = await Blog.find({}).sort({ createdAt: -1 });

        // Preparing blogs data with proper image URLs or data
        const processedBlogs = blogs.map(blog => {
            return {
                id: blog._id,
                title: blog.title,
                content: blog.content,
                authorSignature: blog.authorSignature,
                createdAt: blog.createdAt,
                thumbnailData: blog.thumbnailData // Assuming it contains Base64 encoded data or a path to the image
            };
        });

        // Sending the processed blogs as the response
        res.json({ success: true, data: processedBlogs });
    } catch (error) {
        console.error('Failed to fetch blogs:', error);
        res.status(500).send({ success: false, message: 'Failed to fetch blogs', error: error.message });
    }
});

app.get('/api/latest-blog', async (req, res) => {
    try {
        const latestBlog = await Blog.findOne().sort({ createdAt: -1 }).select('title thumbnailData');

        if (!latestBlog) {
            return res.status(404).send({
                success: false, 
                message: "No blog posts found"
            });
        }

        // Check if the thumbnail is a URL or a Base64 string
        const thumbnailUrl = latestBlog.thumbnailData.startsWith('data:image')
                            ? latestBlog.thumbnailData
                            : `${process.env.API_URL}/uploads/${latestBlog.thumbnailData}`;

        res.json({
            success: true,
            message: "Latest blog fetched successfully",
            data: {
                title: latestBlog.title,
                thumbnailUrl: thumbnailUrl
            }
        });
    } catch (error) {
        console.error('Failed to fetch the latest blog:', error);
        res.status(500).send({
            success: false, 
            message: 'Failed to fetch the latest blog',
            error: error.message
        });
    }
});

app.get('/api/blog/:id', async (req, res) => {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ success: false, message: "Invalid blog ID format." });
    }

    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog post not found." });
        }
        res.json({ success: true, data: blog });
    } catch (error) {
        console.error(`Failed to fetch blog with ID ${id}:`, error);
        res.status(500).json({ success: false, message: 'Failed to fetch blog', error: error.message });
    }
});

app.delete('/api/blog/:id', async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).send({ success: false, message: "Blog not found." });
        }
        res.send({ success: true, message: "Blog deleted successfully." });
    } catch (error) {
        res.status(500).send({ success: false, message: "Failed to delete blog" });
    }
});
app.post('/api/comments', async (req, res) => {
    const { blogId, userId, userName, content, parentId } = req.body;

    if (!blogId || !userId || !content) {
        return res.status(400).send({ success: false, message: "Missing required comment fields." });
    }

    try {
        const newComment = new Comment({
            blogId,
            userId,
            userName,
            content,
            parentId  // This may be undefined if it's not a reply, which is fine
        });
        await newComment.save();
        res.status(201).send({ success: true, message: "Comment added successfully", comment: newComment });
    } catch (error) {
        console.error('Failed to save comment:', error);
        res.status(500).send({ success: false, message: 'Failed to save comment' });
    }
});
app.get('/api/comments/:blogId', async (req, res) => {
    try {
        const comments = await Comment.find({ blogId: req.params.blogId });
        const commentMap = {};

        // First, map all comments by their id for quick access
        comments.forEach(comment => {
            commentMap[comment._id] = comment.toJSON();  // Convert to JSON if using Mongoose
            commentMap[comment._id].replies = [];  // Initialize replies array
        });

        // Now, structure the comments by nesting replies
        const topLevelComments = [];
        comments.forEach(comment => {
            if (comment.parentId) {
                commentMap[comment.parentId].replies.push(commentMap[comment._id]);
            } else {
                topLevelComments.push(commentMap[comment._id]);
            }
        });

        res.json({ success: true, comments: topLevelComments });
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments' });
    }
});
app.post('/api/store-google-user', async (req, res) => {
    const { googleId, displayName, email, imageUrl } = req.body;

    try {
        // Check if user already exists
        const existingUser = await GoogleUser.findOne({ googleId: googleId });
        if (existingUser) {
            return res.status(200).json({ message: "User already exists", userId: existingUser._id });
        }

        // Create a new user if not already exists
        const newUser = new GoogleUser({
            googleId,
            displayName,
            email,
            imageUrl
        });

        await newUser.save();
        res.status(201).json({ message: "User saved successfully", userId: newUser._id });
    } catch (error) {
        console.error('Failed to save user:', error);
        res.status(500).json({ success: false, message: 'Failed to save user' });
    }
});
app.get('/', (req, res) => {
    res.send('Welcome to my server!');
});
const port = process.env.B_PORT || 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});