import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type ResumeDocument = Resume & Document;

@Schema({ timestamps: true })
export class Resume {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: string;

  @Prop({ default: 'My Resume' })
  title: string;

  @Prop({
    type: String,
    enum: ['draft', 'analyzed', 'exported'],
    default: 'draft',
  })
  status: string;

  @Prop({ default: '' })
  rawData: string;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  structuredData: any;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
