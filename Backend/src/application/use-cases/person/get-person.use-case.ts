import { Injectable } from '@nestjs/common';
import { PersonService } from '../../implementations/person.service';
import { PersonResponseDto } from '../../dtos/person/person-response.dto';

@Injectable()
export class GetPersonUseCase {
  constructor(private readonly personService: PersonService) {}

  async executeById(id: string): Promise<PersonResponseDto> {
    this.validateId(id);

    return await this.personService.getPersonById(id);
  }

  async executeGetAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: PersonResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    this.validatePagination(page, limit);

    return await this.personService.getAllPersons(page, limit);
  }

  private validateId(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('Person ID is required');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format for person ID');
    }
  }

  private validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }
}
