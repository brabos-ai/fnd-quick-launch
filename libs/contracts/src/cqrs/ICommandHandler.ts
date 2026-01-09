import { ICommand } from './ICommand';

export interface ICommandHandler<TCommand extends ICommand, TResult = any> {
  execute(command: TCommand): Promise<TResult>;
}