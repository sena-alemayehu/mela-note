import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { AttachmentStorageService } from './attachment-storage.service';

@Module({
  imports: [AuthModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService, AttachmentStorageService],
  exports: [AttachmentsService, AttachmentStorageService],
})
export class AttachmentsModule {}
