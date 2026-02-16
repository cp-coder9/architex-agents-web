import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import adminRoutes from './routes/admin';
import freelancerRoutes from './routes/freelancer';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const uploadPath = path.resolve(process.cwd(), 'server', 'uploads');

async function ensureUploadDirectory() {
    await fs.mkdir(uploadPath, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadPath));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Architex Agents API is running' });
});

app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/admin', adminRoutes);
app.use('/freelancer', freelancerRoutes);

ensureUploadDirectory().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
});
