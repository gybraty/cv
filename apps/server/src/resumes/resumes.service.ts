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

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name) private resumeModel: Model<ResumeDocument>,
  ) {}

  async create(
    userId: string,
    createResumeDto: CreateResumeDto,
  ): Promise<Resume> {
    const newResume = new this.resumeModel({
      userId,
      ...createResumeDto,
    });
    return newResume.save();
  }

  async findAll(userId: string): Promise<Resume[]> {
    return this.resumeModel
      .find({ userId })
      .select('title status updatedAt') // Optimize selection
      .exec();
  }

  async findOne(id: string, userId: string): Promise<Resume> {
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
    userId: string,
    updateResumeDto: UpdateResumeDto,
  ): Promise<Resume> {
    await this.findOne(id, userId); // Verify ownership and existence

    // Use findByIdAndUpdate to update fields
    const updatedResume = await this.resumeModel
      .findByIdAndUpdate(id, { $set: updateResumeDto }, { new: true })
      .exec();

    return updatedResume;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // Verify ownership and existence
    await this.resumeModel.findByIdAndDelete(id).exec();
  }
}
