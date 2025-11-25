import { Injectable } from '@nestjs/common';
import { PersonService } from '../../implementations/person.service';
import { UpdatePersonDto } from '../../dtos/person/update-person.dto';
import { PersonResponseDto } from '../../dtos/person/person-response.dto';

@Injectable()
export class UpdatePersonUseCase {
  constructor(private readonly personService: PersonService) {}

  async execute(id: string, updatePersonDto: UpdatePersonDto): Promise<PersonResponseDto> {
    this.validateId(id);
    this.validateBusinessRules(updatePersonDto);

    return await this.personService.updatePerson(id, updatePersonDto);
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

  private validateBusinessRules(updatePersonDto: UpdatePersonDto): void {
    if (updatePersonDto.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }
  }
}
