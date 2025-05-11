import { Router } from 'express';
import { Container } from 'inversify';
import { TYPES } from '../config/types';
import { Base64Controller, base64UploadMiddleware } from '../controllers/base64Controller';

export function setupBase64Routes(router: Router, container: Container): void {
    const base64Controller = container.get<Base64Controller>(TYPES.Base64Controller);

    router.get('/', base64Controller.getBase64Page);
    router.post('/encode', base64Controller.encode);
    router.post('/decode', base64Controller.decode);
    router.post('/encode-file', base64UploadMiddleware.single('file'), base64Controller.encodeFile);
    router.post('/decode-file', base64Controller.decodeFile);
} 