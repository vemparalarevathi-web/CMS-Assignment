const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required')
});

const blockSchema = z.object({
  _id: z.string().optional(),
  type: z.enum(['header', 'paragraph', 'list', 'table', 'equation', 'callout', 'image']),
  data: z.record(z.any()),
  order: z.number().default(0)
});

const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional(),
  status: z.enum(['draft', 'published']).optional(),
  blocks: z.array(blockSchema).optional()
});

const updatePageSchema = createPageSchema.partial();

module.exports = { loginSchema, createPageSchema, updatePageSchema, blockSchema };
