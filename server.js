const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Serve the CSS file
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/styles.css'));
});

// Serve the JavaScript file
app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/script.js'));
});

// Handle the image upload
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.resolve(req.file.path);

    const pythonProcess = spawn('python', ['pipeline_model.py', filePath]);

    pythonProcess.stdout.on('data', (data) => {
        const result = data.toString();
        res.json(JSON.parse(result));
        fs.unlinkSync(filePath); // Remove the temporary file
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error processing image' });
        fs.unlinkSync(filePath); // Remove the temporary file
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
