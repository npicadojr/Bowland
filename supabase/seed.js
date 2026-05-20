import { createClient } from '@supabase/supabase-js'
import { menuCategories, menuProducts } from '../src/menuData.js'

const { VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
const SUPABASE_URL = process.env.SUPABASE_URL || VITE_SUPABASE_URL

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const slugify = (value) =>
  String(value)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const cleanDescription = (description) => {
  const value = String(description || '').trim()
  return value && value.toLowerCase() !== 'null' ? value : null
}

const categoryRows = menuCategories.map((category) => ({
  name: category.label,
  slug: slugify(category.label),
  display_order: category.order,
}))

const { data: insertedCategories, error: categoryError } = await supabase
  .from('menu_categories')
  .insert(categoryRows)
  .select('id, slug')

if (categoryError) {
  console.error('Error inserting menu_categories:', categoryError.message)
  process.exit(1)
}

const categoryIdsBySlug = new Map(
  insertedCategories.map((category) => [category.slug, category.id]),
)

const categoryIdsByOriginalId = new Map(
  menuCategories.map((category) => [
    category.id,
    categoryIdsBySlug.get(slugify(category.label)),
  ]),
)

const productRows = menuProducts.map((product) => ({
  name: product.name,
  category_id: categoryIdsByOriginalId.get(product.categoryId) || null,
  price: Number.isFinite(product.price) && product.price > 0 ? product.price : null,
  description: cleanDescription(product.description),
  image_url: product.image || null,
  available: !product.outOfStock,
  display_order: product.order,
}))

const { data: insertedProducts, error: productError } = await supabase
  .from('menu_products')
  .insert(productRows)
  .select('id')

if (productError) {
  console.error('Error inserting menu_products:', productError.message)
  process.exit(1)
}

console.log(`Inserted ${insertedCategories.length} categories.`)
console.log(`Inserted ${insertedProducts.length} products.`)
