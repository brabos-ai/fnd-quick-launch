import { Controller, Get, Post, Body, Param, UseGuards, Req, RawBodyRequest, Headers } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { StripeWebhookService } from './stripe-webhook.service';
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
    private readonly webhookService: StripeWebhookService,
  ) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async createCheckoutSession(
    @Body() dto: CreateCheckoutDto,
    @Req() req: any,
  ): Promise<{ checkoutUrl: string; sessionId: string }> {
    const userId = req.user.id;
    return this.billingService.createCheckoutSession(dto, userId);
  }

  @Post('portal')
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

  @Post('webhook')
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const payload = req.rawBody;

    if (!payload) {
      throw new Error('Missing raw body');
    }

    await this.webhookService.handleWebhook(payload, signature);

    return { received: true };
  }
}
