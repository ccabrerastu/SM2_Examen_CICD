import { Injectable, Inject } from '@nestjs/common';
import { IPersonRepository } from '../interfaces/repositories/person-repository.interface';
import { CreatePersonDto } from '../dtos/person/create-person.dto';
import { UpdatePersonDto } from '../dtos/person/update-person.dto';
import { PersonResponseDto } from '../dtos/person/person-response.dto';
import { Person } from '../../domain/entities/person.entity';
import { PersonNotFoundError } from '../../domain/errors/domain.errors';

@Injectable()
export class PersonService {
  constructor(
    @Inject('IPersonRepository')
    private readonly personRepository: IPersonRepository,
  ) {}

  async createPerson(createPersonDto: CreatePersonDto): Promise<PersonResponseDto> {
    const person = await this.personRepository.create(createPersonDto);
    return this.mapToResponseDto(person);
  }

  async getPersonById(id: string): Promise<PersonResponseDto> {
    const person = await this.personRepository.findById(id);
    if (!person) {
      throw new PersonNotFoundError(id);
    }

    return this.mapToResponseDto(person);
  }

  async getAllPersons(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: PersonResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const [persons, total] = await this.personRepository.findAll(page, limit);

    return {
      data: persons.map(person => this.mapToResponseDto(person)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updatePerson(id: string, updatePersonDto: UpdatePersonDto): Promise<PersonResponseDto> {
    const existingPerson = await this.personRepository.findById(id);
    if (!existingPerson) {
      throw new PersonNotFoundError(id);
    }

    const updatedPerson = await this.personRepository.update(id, updatePersonDto);
    if (!updatedPerson) {
      throw new PersonNotFoundError(id);
    }

    return this.mapToResponseDto(updatedPerson);
  }

  private mapToResponseDto(person: Person): PersonResponseDto {
    return {
      id: person.id,
      fullName: person.fullName,
      createdAt: person.createdAt,
      updatedAt: person.updatedAt,
    };
  }
}
