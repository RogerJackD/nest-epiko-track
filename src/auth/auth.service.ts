import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository : Repository<User>,
    private readonly JwtService:  JwtService,
  ){}

  async createUser(createUserDto: CreateUserDto) {

    const { areaId, ...userData } = createUserDto;

    try {
      const newUser = this.userRepository.create({ ...userData, area: { id: areaId } });
      await this.userRepository.save(newUser);
      return newUser
    } catch (error) {
      this.handleDbErrors(error)
    }
  }

  async findAllUsers() {
    const UsersFound = await this.userRepository.find({
      relations: ['role', 'area']
    })
    return UsersFound;
  }

  async findOneUser(id: string) {

    const userFound = await this.userRepository.findOne({
      where: {id},
      relations: ['role', 'area'],
    })

    if(!userFound){
      throw new BadRequestException(`user with id ${id} not was found`)
    }
    return userFound;
  }
  
  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    
    await this.findOneUser(id);

    const { areaId, ...userData } = updateUserDto;

    await this.userRepository.update(id, {...userData, area: { id: areaId }})
    return {
      message: 'Usuario actualizado exitosamente',
      success: true
    };
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  async loginUser(loginUserDto: LoginUserDto) {

    console.log(loginUserDto)
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { id: true, email: true, password: true }
    });

    if( !user )
      throw new UnauthorizedException('Credentials are not valid (email)');

    if( user.password !== password )
      throw new UnauthorizedException('Credentials are not valid (password)');
    

    const { id: _, ...userWithoutId } = user;


    return {
      ...userWithoutId,
      token: this.getJwtToken( { id: user.id } ),
    };
  }

  async checkAuthStatus( user: User ){
    return {
      ...user,
      token: this.getJwtToken( { id: user.id } ),
    };
  }


  private getJwtToken( payload: JwtPayload ){
    const token = this.JwtService.sign( payload );
    return token;
  }

  handleDbErrors(error: any): never {
    if( error.code === '23505')
      throw new BadRequestException(error.detail)

    throw new BadRequestException('error unexpected check logs')
  }
}
