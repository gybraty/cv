import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false })
class Profile {
  @Prop()
  fullName?: string;

  @Prop()
  avatarUrl?: string;
}

@Schema({ _id: false })
class Settings {
  @Prop({ enum: ['light', 'dark', 'system'], default: 'system' })
  theme: string;

  @Prop({ default: false })
  onboardingCompleted: boolean;
}

@Schema({ _id: false })
class Usage {
  @Prop({ default: 0 })
  generationsCount: number;

  @Prop({ default: Date.now })
  lastActiveAt: Date;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, index: true })
  supabaseId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ type: Profile, default: () => ({}) })
  profile: Profile;

  @Prop({
    type: Settings,
    default: () => ({ theme: 'system', onboardingCompleted: false }),
  })
  settings: Settings;

  @Prop({
    type: Usage,
    default: () => ({ generationsCount: 0, lastActiveAt: Date.now() }),
  })
  usage: Usage;
}

export const UserSchema = SchemaFactory.createForClass(User);
