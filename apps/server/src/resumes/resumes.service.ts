import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
    private readonly usersService: UsersService,
  ) {}

  private async getMongoUserId(supabaseId: string): Promise<string> {
    const user = await this.usersService.findBySupabaseId(supabaseId);
    return user._id.toString();
  }

  async create(
    supabaseId: string,
    createResumeDto: CreateResumeDto,
  ): Promise<Resume> {
    const userId = await this.getMongoUserId(supabaseId);
    const newResume = new this.resumeModel({
      userId,
      ...createResumeDto,
    });
    return newResume.save();
  }

  async findAll(supabaseId: string): Promise<Resume[]> {
    const userId = await this.getMongoUserId(supabaseId);
    return this.resumeModel
      .find({ userId })
      .select('title status updatedAt')
      .exec();
  }

  async findOne(id: string, supabaseId: string): Promise<Resume> {
    const userId = await this.getMongoUserId(supabaseId);
    const resume = await this.resumeModel.findById(id).exec();
    if (!resume) {
      throw new NotFoundException(`Resume with ID ${id} not found`);
    }
    if (resume.userId.toString() !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this resume',
      );
    }
    return resume;
  }

  async update(
    id: string,
    supabaseId: string,
    updateResumeDto: UpdateResumeDto,
  ): Promise<Resume> {
    await this.findOne(id, supabaseId); // Verify ownership and existence

    const updatedResume = await this.resumeModel
      .findByIdAndUpdate(id, { $set: updateResumeDto }, { new: true })
      .exec();

    return updatedResume;
  }

  async remove(id: string, supabaseId: string): Promise<void> {
    await this.findOne(id, supabaseId); // Verify ownership and existence
    await this.resumeModel.findByIdAndDelete(id).exec();
  }
}
