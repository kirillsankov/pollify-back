import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsEmail,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;
}
