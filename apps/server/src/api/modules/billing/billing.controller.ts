import { Controller, Get, Post, Body, Param, UseGuards, Req, RawBodyRequest, Headers, HttpCode, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { PaymentProvider } from '@fnd/domain';
import { ProcessWebhookCommand } from './commands/ProcessWebhookCommand';
import {
  CreateCheckoutDto,
  CreatePortalDto,
  BillingInfoResponseDto,
  PlanResponseDto,
} from './dtos';

@Controller('billing')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('checkout')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutDto,
    @Req() req: any,
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    const userId = req.user.id;
    return this.billingService.createCheckoutSession(dto, userId);
  }

  @Post('portal')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async createPortalSession(
    @Body() dto: CreatePortalDto,
    @Req() req: any,
  ): Promise<{ portalUrl: string }> {
    const userId = req.user.id;
    return this.billingService.createPortalSession(dto, userId);
  }

  @Get('workspace/:workspaceId')
  @UseGuards(JwtAuthGuard)
  async getWorkspaceBillingInfo(
    @Param('workspaceId') workspaceId: string,
    @Req() req: any,
  ): Promise<BillingInfoResponseDto> {
    const userId = req.user.id;
    return this.billingService.getWorkspaceBillingInfo(workspaceId, userId);
  }

  @Get('plans')
  async getAvailablePlans(): Promise<PlanResponseDto[]> {
    return this.billingService.getAvailablePlans();
  }

  @Post('webhook/:provider')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers() headers: Record<string, string>,
  ): Promise<{ received: boolean }> {
    // Validate provider
    const validProviders = Object.values(PaymentProvider);
    const normalizedProvider = provider.toUpperCase() as PaymentProvider;
    if (!validProviders.includes(normalizedProvider)) {
      throw new NotFoundException(`Unknown payment provider: ${provider}`);
    }

    const payload = req.rawBody;
    if (!payload) {
      throw new BadRequestException('Missing raw body');
    }

    // Extract signature based on provider
    const signature = this.extractWebhookSignature(normalizedProvider, headers);

    return this.commandBus.execute(
      new ProcessWebhookCommand(normalizedProvider, payload, signature),
    );
  }

  private extractWebhookSignature(provider: PaymentProvider, headers: Record<string, string>): string {
    switch (provider) {
      case PaymentProvider.STRIPE:
        return headers['stripe-signature'] || '';
      default:
        return headers['x-webhook-signature'] || headers['x-signature'] || '';
    }
  }
}
