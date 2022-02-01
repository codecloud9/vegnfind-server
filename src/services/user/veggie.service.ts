import {ConflictException, NotFoundException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Veggie} from 'src/entities/veggie.entity';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class VeggieService {
  constructor(
    @InjectRepository(Veggie)
    private veggieRepository: Repository<Veggie>,
  ) {}

  async findOneByCondition(condition: any): Promise<Veggie> {
    try {
      return await this.veggieRepository.findOneOrFail(condition);
    } catch (error) {
      throw new NotFoundException(error, "This Veggie doesn't exist");
    }
  }

  async createOne(user: Veggie): Promise<Veggie> {
    // check if user already exists in db
    const userExists = await this.veggieRepository.findOne(null, {
      where: {email: user.email},
    });
    if (userExists) {
      throw new ConflictException(null, 'This User already exists!');
    }

    // if it doesn't exist, hash password and lowercase email
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const hashedUser = {
      ...user,
      password: hashedPassword, // hash password
      email: user.email.toLowerCase(), // lowercase email
    };

    // create new instance of Veggie and save into db
    const newUser = await this.veggieRepository.create({...hashedUser});
    return this.veggieRepository.save(newUser);
  }

  async updateOne(veggie: Veggie): Promise<Veggie> {
    // first make sure email is lowercase
    const veggieLow = {...veggie, email: veggie.email.toLowerCase()};

    // find the stored user in db
    const id = veggieLow.id;
    const oldVeggie = await this.findOneByCondition({id});

    // create new user with updated properties and save it to db
    const newVeggie = {...oldVeggie, ...veggieLow};
    return this.veggieRepository.save(newVeggie);
  }

  async deleteOneByCondition(condition: any): Promise<Veggie> {
    const veggie = await this.findOneByCondition({condition});
    return await this.veggieRepository.remove(veggie);
  }

  // ONLY FOR DEVELOPMENT
  async deleteAll(): Promise<void> {
    await this.veggieRepository
      .createQueryBuilder()
      .delete()
      .from(Veggie)
      .execute();
  }
}