import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Person } from '../../domain/entities/person.entity';
import { IPersonRepository } from '../../application/interfaces/repositories/person-repository.interface';
import { CreatePersonDto } from '../../application/dtos/person/create-person.dto';
import { UpdatePersonDto } from '../../application/dtos/person/update-person.dto';

@Injectable()
export class PersonRepository implements IPersonRepository {
  constructor(
    @InjectRepository(Person)
    private readonly repository: Repository<Person>,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const person = this.repository.create({
      ...createPersonDto,
    });
    return await this.repository.save(person);
  }

  async findById(id: string): Promise<Person | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findAll(page: number, limit: number): Promise<[Person[], number]> {
    return await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person | null> {
    const updateData: Partial<Person> = {
      ...updatePersonDto,
    };

    const result = await this.repository.update(id, updateData);
    if (result.affected === 0) {
      return null;
    }
    return await this.findById(id);
  }
}
