/**
 * Thread Identifier
 *
 * Information to identify or create a conversation thread
 */
export interface ThreadIdentifier {
  /**
   * Ticket/conversation ID from provider
   */
  ticketId?: string;

  /**
   * Ticket UUID (unique identifier)
   */
  ticketUuid?: string;

  /**
   * Contact ID from provider
   */
  contactId?: string;
}

/**
 * Batch Context
 *
 * Aggregated information about the entire message batch.
 * Used to optimize thread creation and avoid repeated data extraction.
 *
 * Key insight: One webhook payload = one sender = one thread
 */
export interface BatchContext {
  /**
   * Provider name (whaticket, waha, notificamehub)
   */
  provider: string;

  /**
   * Channel type (whatsapp, instagram, mercadolivre)
   */
  channel: string;

  /**
   * Implementation type (baileys, official, whatsmeow, gows)
   */
  implementation: string;

  /**
   * Sender ID (phone number, user ID)
   */
  senderId: string;

  /**
   * Sender name (optional)
   */
  senderName?: string;

  /**
   * Sender phone (optional, normalized format)
   */
  senderPhone?: string;

  /**
   * Account ID (multi-tenancy)
   */
  accountId: string;

  /**
   * Project ID (optional)
   */
  projectId?: string;

  /**
   * Thread identification data
   */
  threadIdentifier: ThreadIdentifier;
}

/**
 * Parse Result Wrapper
 *
 * Generic wrapper for parser results with success/error handling
 * and optional metadata for parser-level information.
 */
export interface ParseResult<T> {
  /**
   * Whether the parsing was successful
   */
  success: boolean;

  /**
   * Parsed data (only present if success = true)
   */
  data?: T;

  /**
   * Error that occurred during parsing (only present if success = false)
   */
  error?: Error;

  /**
   * Optional metadata from the parser
   * Can contain additional information that doesn't belong in the data
   * Examples: messageCount, parsedAt, parserVersion, etc.
   */
  metadata?: Record<string, any>;

  /**
   * Batch context (aggregated information)
   *
   * Contains sender, thread, and provider information extracted once
   * for the entire batch. Used to optimize thread creation and avoid
   * repeated data extraction in loops.
   *
   * Optional: parsers can leave this undefined if not applicable
   */
  batchContext?: BatchContext;
}
