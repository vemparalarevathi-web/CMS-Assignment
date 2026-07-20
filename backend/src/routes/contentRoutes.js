const express = require('express');
const {
  listPagesAdmin,
  getPageAdmin,
  createPage,
  updatePage,
  deletePage,
  getPublicPageBySlug,
  listPublicPages
} = require('../controllers/pageController');
const protectRoute = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { createPageSchema, updatePageSchema } = require('../utils/validators');

const router = express.Router();

// ---- Public (read-only, published content only) ----
router.get('/public', listPublicPages);
router.get('/public/:slug', getPublicPageBySlug);

// ---- Admin (protected) ----
router.get('/pages', protectRoute, listPagesAdmin);
router.get('/pages/:id', protectRoute, getPageAdmin);
router.post('/pages', protectRoute, validate(createPageSchema), createPage);
router.put('/pages/:id', protectRoute, validate(updatePageSchema), updatePage);
router.delete('/pages/:id', protectRoute, deletePage);

module.exports = router;
