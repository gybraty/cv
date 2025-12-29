import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOrCreate(supabaseId: string, email: string): Promise<User> {
    const user = await this.userModel.findOne({ supabaseId });

    if (user) {
      user.usage.lastActiveAt = new Date();
      return user.save();
    }

    const newUser = new this.userModel({
      supabaseId,
      email,
    });
    return newUser.save();
  }

  async findBySupabaseId(supabaseId: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ supabaseId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(supabaseId: string, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findOne({ supabaseId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateDto.profile) {
      // Use logical OR for partial updates or Object.assign logic if strict replacement is not desired for nested
      // But Mongoose update logic with dot notation is cleaner, OR manual merge
      // Here we merge properties manually
      user.profile = { ...user.profile, ...updateDto.profile };
    }

    if (updateDto.settings) {
      user.settings = { ...user.settings, ...updateDto.settings };
    }

    return user.save();
  }

  async remove(supabaseId: string): Promise<User> {
    const user = await this.userModel.findOneAndDelete({ supabaseId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // TODO: Delete all related Resumes (Cascade delete)
    return user;
  }
}
