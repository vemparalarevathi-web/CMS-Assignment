const mongoose = require('mongoose');

/**
 * Block-based content schema.
 *
 * Rather than storing raw HTML (which is hard to validate, style consistently,
 * and render safely) each unit of content on a page is a typed "block".
 * The public frontend's BlockRenderer switches on `type` and renders `data`
 * accordingly. This keeps the schema flexible enough to support long-form
 * text, nested lists, tables, and LaTeX equations without needing a schema
 * migration every time a new content shape appears on a page.
 */
const BlockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['header', 'paragraph', 'list', 'table', 'equation', 'callout', 'image'],
      required: true
    },
    // Shape of `data` depends on `type`:
    //  header    -> { text, level }                (level 1-4)
    //  paragraph -> { text }                        (supports **bold**, *italic*, inline $math$)
    //  list      -> { ordered: bool, items: [ { text, items?: [...] } ] }  (nested)
    //  table     -> { headers: [String], rows: [[String]] }
    //  equation  -> { equation: String, displayMode: bool }  (raw LaTeX)
    //  callout   -> { text, variant: 'info'|'warning'|'success' }
    //  image     -> { url, alt, caption }
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    order: { type: Number, required: true, default: 0 }
  },
  { _id: true }
);

const PageSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'A page title is required'], trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    blocks: { type: [BlockSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Page', PageSchema);
