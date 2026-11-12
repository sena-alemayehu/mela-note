
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AttachmentsModule } from '../attachments/attachments.module';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [AuthModule, AttachmentsModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
