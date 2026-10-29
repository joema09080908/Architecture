import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const settings = sqliteTable('settings', { id: text('id').primaryKey(), value: text('value').notNull() });
export const observations = sqliteTable('observations', { id: text('id').primaryKey(), payload: text('payload').notNull(), originalKey: text('original_key').notNull(), previewKey: text('preview_key'), published: integer('published').notNull().default(1), createdAt: text('created_at').notNull() });
export const uploads = sqliteTable('uploads', { id: text('id').primaryKey(), ownerId: text('owner_id').notNull(), objectKey: text('object_key').notNull(), uploadId: text('upload_id').notNull(), payload: text('payload').notNull(), createdAt: text('created_at').notNull() });
