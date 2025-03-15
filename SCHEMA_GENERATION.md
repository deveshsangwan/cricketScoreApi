# Schema Generation with ts-to-zod

This project uses [ts-to-zod](https://github.com/fabien0102/ts-to-zod) to automatically generate [Zod](https://github.com/colinhacks/zod) schemas from TypeScript interfaces.

## How it works

1. Define your TypeScript interfaces in the `app/src/types` directory
2. Run `pnpm generate-schemas` to generate Zod schemas in `app/src/schemas`
3. Import and use these schemas for runtime validation

## Directory Structure

```
app/
  src/
    types/       # TypeScript interfaces
      index.ts   # Exports all types
      token.types.ts
      liveMatches.types.ts
      matchStats.types.ts
    schemas/     # Auto-generated Zod schemas
```

## Adding New Types

1. Create or update TypeScript interfaces in the appropriate file in `app/src/types/`
2. Export the new type from `app/src/types/index.ts`
3. Run `pnpm generate-schemas` to update the Zod schemas
4. Import the generated schema from `app/src/schemas` for validation

## JSDoc Support

You can add JSDoc comments to your TypeScript interfaces for better documentation:

```typescript
/**
 * Request body for generating a token
 */
export interface TokenRequest {
  /** The username for authentication */
  username: string;
  /** The password for authentication */
  password: string;
}
```

## Usage Example

```typescript
// Import the schema
import { tokenRequestSchema } from './schemas';

// Validate data
const validateData = (data: unknown) => {
  try {
    const validData = tokenRequestSchema.parse(data);
    return { success: true, data: validData };
  } catch (error) {
    return { success: false, error };
  }
};
```

## Middleware Example

```typescript
import { validateBody } from './validation';
import { tokenRequestSchema } from './schemas';

// Use in Express routes
app.post('/api/token', validateBody(tokenRequestSchema), (req, res) => {
  // req.body is now validated and typed
  // ...
});
```
