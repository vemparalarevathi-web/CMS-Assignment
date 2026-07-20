const slugify = require('slugify');
const Page = require('../models/Page');

// GET /api/v1/content/pages  (admin: all pages, incl. drafts)
async function listPagesAdmin(req, res, next) {
  try {
    const pages = await Page.find().sort({ updatedAt: -1 }).select('title slug status updatedAt');
    res.json({ success: true, data: pages });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/content/pages/:id (admin, by Mongo _id, incl. drafts)
async function getPageAdmin(req, res, next) {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/content/pages (admin)
async function createPage(req, res, next) {
  try {
    const { title, blocks = [], status = 'draft' } = req.body;
    let { slug } = req.body;

    if (!slug) slug = slugify(title, { lower: true, strict: true });

    const page = await Page.create({
      title,
      slug,
      status,
      blocks,
      updatedBy: req.admin.id
    });

    res.status(201).json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

// PUT /api/v1/content/pages/:id (admin)
async function updatePage(req, res, next) {
  try {
    const updates = { ...req.body, updatedBy: req.admin.id };

    const page = await Page.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/v1/content/pages/:id (admin)
async function deletePage(req, res, next) {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/content/public/:slug (public: published only)
async function getPublicPageBySlug(req, res, next) {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/content/public (public: list published pages, lightweight)
async function listPublicPages(req, res, next) {
  try {
    const pages = await Page.find({ status: 'published' }).select('title slug updatedAt');
    res.json({ success: true, data: pages });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPagesAdmin,
  getPageAdmin,
  createPage,
  updatePage,
  deletePage,
  getPublicPageBySlug,
  listPublicPages
};
