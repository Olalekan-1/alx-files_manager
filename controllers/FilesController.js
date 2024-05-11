import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import Bull from 'bull';
import imageThumbnail from 'image-thumbnail';

const fileQueue = new Bull('fileQueue');

class FilesController {
    static async postUpload(req, res) {
        const { name, type, parentId = '0', isPublic = false, data } = req.body;
        const token = req.headers['x-token'];

        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Missing type' });
        }

        if ((type !== 'folder') && !data) {
            return res.status(400).json({ error: 'Missing data' });
        }

        if (parentId !== '0') {
            const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });

            if (!parentFile) {
                return res.status(400).json({ error: 'Parent not found' });
            }

            if (parentFile.type !== 'folder') {
                return res.status(400).json({ error: 'Parent is not a folder' });
            }
        }

        const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const localPath = `${filePath}/${name}`;

        if (type !== 'folder') {
            const buffer = Buffer.from(data, 'base64');
            fs.writeFileSync(localPath, buffer);
        }

        const newFile = {
            userId,
            name,
            type,
            isPublic,
            parentId,
            localPath: (type === 'folder') ? null : localPath,
        };

        const result = await dbClient.db.collection('files').insertOne(newFile);

        if (type === 'image') {
            fileQueue.add({ userId, fileId: result.insertedId });
        }

        return res.status(201).json({
            id: result.insertedId.toString(),
            userId,
            name,
            type,
            isPublic,
            parentId,
        });
    }
}

export default FilesController;
