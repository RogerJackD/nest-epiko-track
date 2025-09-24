import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
  ){}

  async createUser(createUserDto: CreateUserDto) {

    try {
      const newUser = this.userRepository.create(createUserDto);
      await this.userRepository.save(newUser);
      return newUser
    } catch (error) {
      this.handleDbErrors(error)
    }
  }

  async findAllUsers() {
    const UsersFound = await this.userRepository.find()
    return UsersFound;
  }

  async findOneUser(id: string) {

    const userFound = await this.userRepository.findOneBy({id})

    if(!userFound){
      throw new BadRequestException(`user with id ${id} not was found`)
    }
    return userFound;
  }

  async updateUser(id: string, updateAuthDto: UpdateUserDto) {
    
    try {
      this.findOneUser(id);
      
      await this.userRepository.update(id, {...updateAuthDto})

    } catch (error) {
      this.handleDbErrors(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  handleDbErrors(error: any): never {
    if( error.code === '23505')
      throw new BadRequestException(error.detail)

    throw new BadRequestException('error unexpected check logs')
  }
}
