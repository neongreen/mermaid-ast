/**
 * Utility functions for mermaid-ast
 */

/**
 * Helper for exhaustive type checking in switch statements.
 *
 * Use this in the default case of a switch statement to ensure
 * all cases of a union type are handled at compile time.
 *
 * @example
 * ```typescript
 * type Status = 'pending' | 'active' | 'done';
 *
 * function handleStatus(status: Status): string {
 *   switch (status) {
 *     case 'pending': return 'Waiting';
 *     case 'active': return 'In progress';
 *     case 'done': return 'Complete';
 *     default:
 *       return assertNever(status);
 *   }
 * }
 * ```
 *
 * If a new case is added to the union type, TypeScript will
 * report an error at the assertNever call until it's handled.
 */
export function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${value}`);
}
