import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { NotesModule } from './notes/notes.module';
import { AuthModule } from './auth/auth.module';
import { AttachmentsModule } from './attachments/attachments.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    NotesModule,
    AttachmentsModule,
  ],
})
export class AppModule {}
