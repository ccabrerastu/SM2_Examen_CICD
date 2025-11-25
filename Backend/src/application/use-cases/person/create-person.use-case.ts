import { Injectable } from '@nestjs/common';
import { PersonService } from '../../implementations/person.service';
import { CreatePersonDto } from '../../dtos/person/create-person.dto';
import { PersonResponseDto } from '../../dtos/person/person-response.dto';

@Injectable()
export class CreatePersonUseCase {
  constructor(private readonly personService: PersonService) {}

  async execute(createPersonDto: CreatePersonDto): Promise<PersonResponseDto> {
    this.validateBusinessRules(createPersonDto);

    return await this.personService.createPerson(createPersonDto);
  }

  private validateBusinessRules(createPersonDto: CreatePersonDto): void {
    if (createPersonDto.fullName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }
  }
}
