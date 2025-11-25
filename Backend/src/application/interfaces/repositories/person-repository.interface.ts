import { Person } from '../../../domain/entities/person.entity';
import { CreatePersonDto } from '../../dtos/person/create-person.dto';
import { UpdatePersonDto } from '../../dtos/person/update-person.dto';

export interface IPersonRepository {
  create(createPersonDto: CreatePersonDto): Promise<Person>;
  findById(id: string): Promise<Person | null>;
  findAll(page: number, limit: number): Promise<[Person[], number]>;
  update(id: string, updatePersonDto: UpdatePersonDto): Promise<Person | null>;
}
