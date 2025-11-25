import { Injectable } from '@nestjs/common';
import { UserResponseDto } from '@/application/dtos/user/user-response.dto';
import { UserService } from '@/application/implementations/user.service';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userService: UserService) {}

  async executeById(id: string): Promise<UserResponseDto> {
    this.validateId(id);

    return await this.userService.getUserById(id);
  }

  async executeByEmail(email: string): Promise<UserResponseDto> {
    this.validateEmail(email);

    return await this.userService.getUserByEmail(email);
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID is required');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format for user ID');
    }
  }

  private validateEmail(email: string): void {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
  }
}
