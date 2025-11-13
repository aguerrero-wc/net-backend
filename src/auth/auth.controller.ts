import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Res,
  Req,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registro de usuario
   * POST /auth/signup
   */
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.authService.signUp(signUpDto);
    return {
      message: 'Usuario registrado exitosamente',
      user,
    };
  }

  /**
   * Inicio de sesión
   * POST /auth/signin
   * Usa LocalAuthGuard para validar credenciales
   */
  @Post('signin')
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() signInDto: SignInDto,
    @CurrentUser() user: User,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    
    // LocalStrategy ya validó las credenciales y adjuntó el usuario a req.user
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    const result = await this.authService.signIn(
      { identifier: user.email || user.nickname, password: signInDto.password },
      ip,
    );

    // Configurar cookie HTTPOnly con el refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true, // No accesible desde JavaScript (previene XSS)
      secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
      sameSite: 'strict', // Previene CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
      path: '/', // Cookie disponible en toda la aplicación
    });

    // Retornar solo el access token (el refresh está en la cookie)
    return {
      message: 'Inicio de sesión exitoso',
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  /**
   * Refrescar tokens
   * POST /auth/refresh
   * Usa RefreshJwtAuthGuard para validar el refresh token
   */
  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async refresh(
    @CurrentUser() user: User & { refreshToken: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    // RefreshJwtStrategy ya validó el refresh token y adjuntó user + refreshToken a req.user
    const tokens = await this.authService.refreshTokens(user.id, user.refreshToken);

    // Actualizar cookie con el nuevo refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      message: 'Tokens refrescados exitosamente',
      accessToken: tokens.accessToken,
    };
  }

  /**
   * Cerrar sesión
   * POST /auth/signout
   * Usa JwtAuthGuard para proteger la ruta
   */
  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async signOut(
    @CurrentUser('id') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Invalidar el refresh token en la BD
    await this.authService.signOut(userId);

    // Eliminar la cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return {
      message: 'Sesión cerrada exitosamente',
    };
  }

  /**
   * Obtener información del usuario actual
   * GET /auth/me
   * Usa JwtAuthGuard para proteger la ruta
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: User) {
    // JwtStrategy ya validó el token y adjuntó el usuario a req.user
    return {
      user,
    };
  }
}