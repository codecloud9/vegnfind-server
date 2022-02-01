import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthService} from '../services/auth/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // super({usernameField: 'email'})
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    console.log('strategy', username);
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException(null, 'Invalid credentials');
    }
    return user; // this return will be attached to req.user in the controller
  }
}