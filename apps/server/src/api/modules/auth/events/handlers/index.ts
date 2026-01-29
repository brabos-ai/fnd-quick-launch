// Event handlers are implementation details and should NOT be exported from index.ts
// Import directly from their files when registering in module providers:
// import { AccountCreatedEventHandler } from './events/handlers/AccountCreatedEventHandler';
//
// This barrel file is intentionally empty to prevent accidental exports.
// Handlers are registered directly in auth.module.ts providers array.