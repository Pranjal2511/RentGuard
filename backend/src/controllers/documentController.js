import path from 'path';
import fs from 'fs';
import { getDocuments, createDocument, deleteDocument as deleteDocumentService } from '../services/documentService.js';
import { Document } from '../models/Document.js';
import { UPLOAD_DIRS } from '../config/storage.js';

export async function listDocuments(req, res, next) {
  try {
    const propertyId = req.query.propertyId || req.params.propertyId;
    const docs = await getDocuments(propertyId, req.query);
    res.status(200).json({
      success: true,
      data: docs,
    });
  } catch (err) {
    next(err);
  }
}

export async function uploadDoc(req, res, next) {
  try {
    const { propertyId, name, type } = req.body;

    let url = req.body.url || null;
    let size = req.body.size || '1.0 MB';
    let fileType = req.body.fileType || 'pdf';
    let fileSizeBytes = 0;

    if (req.file) {
      url = `/uploads/documents/${req.file.filename}`;
      fileSizeBytes = req.file.size;
      size = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;
      fileType = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'pdf';
    }

    const doc = await createDocument(
      {
        propertyId,
        name: name || req.file?.originalname || 'Document',
        type: type || 'lease',
        fileType,
        url,
        size,
        fileSizeBytes,
      },
      req.user
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: doc,
      document: doc,
    });
  } catch (err) {
    next(err);
  }
}

export async function removeDocument(req, res, next) {
  try {
    await deleteDocumentService(req.params.documentId, req.user);
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function downloadDoc(req, res, next) {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.url && doc.url.startsWith('/uploads/')) {
      const relativePath = doc.url.replace('/uploads/', '');
      const filePath = path.join(UPLOAD_DIRS.documents, path.basename(relativePath));

      if (fs.existsSync(filePath)) {
        return res.download(filePath, doc.name);
      }
    }

    res.redirect(doc.url);
  } catch (err) {
    next(err);
  }
}

