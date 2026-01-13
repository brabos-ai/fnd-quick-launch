import { ICommand, ICommandHandler } from '@fnd/contracts';
import { CommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UserRepository } from '@fnd/database';

export class UpdateProfileCommand {
  constructor(
    public readonly userId: string,
    public readonly fullName: string,
  ) {}
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileCommandHandler implements ICommandHandler<any> {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: UserRepository,
  ) {}

  async execute(command: UpdateProfileCommand): Promise<void> {
    // Verify user exists
    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update user fullName
    await this.userRepository.update(command.userId, {
      fullName: command.fullName,
    });
  }
}
