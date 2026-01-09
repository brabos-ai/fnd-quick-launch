import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { EmailChangeRequest, EmailChangeStatus } from '@fnd/domain';
import { Database } from '../types';
import { IEmailChangeRequestRepository } from '../interfaces';

@Injectable()
export class EmailChangeRequestRepository implements IEmailChangeRequestRepository {
  constructor(private db: Kysely<Database>) {}

  async findById(id: string): Promise<EmailChangeRequest | null> {
    const result = await this.db
      .selectFrom('email_change_requests')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return result ? this.toEntity(result) : null;
  }

  async findPendingByUserId(userId: string): Promise<EmailChangeRequest | null> {
    const result = await this.db
      .selectFrom('email_change_requests')
      .selectAll()
      .where('user_id', '=', userId)
      .where('status', '=', EmailChangeStatus.PENDING)
      .executeTakeFirst();

    return result ? this.toEntity(result) : null;
  }

  async create(data: Omit<EmailChangeRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmailChangeRequest> {
    const now = new Date();
    const result = await this.db
      .insertInto('email_change_requests')
      .values({
        user_id: data.userId,
        new_email: data.newEmail,
        status: data.status,
        created_at: now,
        updated_at: now,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.toEntity(result);
  }

  async update(id: string, data: Partial<EmailChangeRequest>): Promise<EmailChangeRequest> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    if (data.newEmail !== undefined) {
      updateData.new_email = data.newEmail;
    }

    const result = await this.db
      .updateTable('email_change_requests')
      .set(updateData)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirstOrThrow();

    return this.toEntity(result);
  }

  async cancelPendingByUserId(userId: string): Promise<void> {
    await this.db
      .updateTable('email_change_requests')
      .set({
        status: EmailChangeStatus.CANCELED,
        updated_at: new Date(),
      })
      .where('user_id', '=', userId)
      .where('status', '=', EmailChangeStatus.PENDING)
      .execute();
  }

  private toEntity(row: any): EmailChangeRequest {
    return {
      id: row.id,
      userId: row.user_id,
      newEmail: row.new_email,
      status: row.status as EmailChangeStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
