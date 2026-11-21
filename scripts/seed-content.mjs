import { createDatabasePool } from "./database-config.mjs";
import { education, freelancers, products, services } from "../lib/data.ts";

const pool = createDatabasePool();
const priceNumber = (value) => Number(String(value).replace(/[^0-9]/g, ""));
const workMode = { Remote: "REMOTE", Onsite: "ONSITE", Hybrid: "HYBRID" };

async function upsertId(sql, values) {
  const [result] = await pool.execute(sql, values);
  return Number(result.insertId);
}

try {
  for (const item of education) {
    const categorySlug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const categoryId = await upsertId(
      "INSERT INTO education_categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name=VALUES(name)",
      [item.category, categorySlug],
    );
    await pool.execute(
      "INSERT INTO education_contents (category_id, title, slug, excerpt, body, format, level, duration_minutes, access, status, published_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED', NOW()) ON DUPLICATE KEY UPDATE category_id=VALUES(category_id), title=VALUES(title), excerpt=VALUES(excerpt), format=VALUES(format), level=VALUES(level), duration_minutes=VALUES(duration_minutes), access=VALUES(access), status='PUBLISHED', deleted_at=NULL",
      [categoryId, item.title, item.slug, item.excerpt, item.excerpt, item.format, item.level, priceNumber(item.duration) || 8, item.access === "Gratis" ? "FREE" : item.access === "Premium" ? "PREMIUM" : "MEMBER"],
    );
  }

  for (const item of services) {
    await pool.execute(
      "INSERT INTO service_packages (name, slug, description, price, original_price, duration_label, billing_period, deliverables, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PUBLISHED') ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), price=VALUES(price), original_price=VALUES(original_price), duration_label=VALUES(duration_label), billing_period=VALUES(billing_period), deliverables=VALUES(deliverables), status='PUBLISHED', deleted_at=NULL",
      [item.name, item.slug, item.desc, priceNumber(item.price), priceNumber(item.oldPrice) || null, item.time, item.billingPeriod ?? null, JSON.stringify(item.deliverables)],
    );
  }

  for (const item of products) {
    const partnerSlug = item.partner.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const categorySlug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const partnerId = await upsertId(
      "INSERT INTO partners (name, slug, status) VALUES (?, ?, 'PUBLISHED') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name=VALUES(name), status='PUBLISHED'",
      [item.partner, partnerSlug],
    );
    const categoryId = await upsertId(
      "INSERT INTO product_categories (name, slug) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name=VALUES(name)",
      [item.category, categorySlug],
    );
    const productId = await upsertId(
      "INSERT INTO products (partner_id, category_id, name, slug, description, regular_price, status) VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), partner_id=VALUES(partner_id), category_id=VALUES(category_id), name=VALUES(name), description=VALUES(description), regular_price=VALUES(regular_price), status='PUBLISHED', deleted_at=NULL",
      [partnerId, categoryId, item.name, item.slug, item.desc, item.price],
    );
    await pool.execute("DELETE FROM product_member_prices WHERE product_id = ?", [productId]);
    await pool.execute(
      "INSERT INTO product_member_prices (product_id, price) VALUES (?, ?)",
      [productId, item.memberPrice],
    );
  }

  for (const item of process.env.SEED_DEMO_FREELANCERS === "true" ? freelancers : []) {
    const email = `directory+${item.slug}@example.com`;
    const userId = await upsertId(
      "INSERT INTO users (name, email, role, email_verified_at) VALUES (?, ?, 'FREELANCER', NOW()) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name=VALUES(name), role='FREELANCER'",
      [item.name, email],
    );
    const profileId = await upsertId(
      "INSERT INTO freelancer_profiles (user_id, slug, bio, city, work_mode, price_from, availability, verified, status, approved_at) VALUES (?, ?, ?, ?, ?, ?, 'Menerima proyek', ?, ?, NOW()) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), bio=VALUES(bio), city=VALUES(city), work_mode=VALUES(work_mode), price_from=VALUES(price_from), availability=VALUES(availability), verified=VALUES(verified), status=VALUES(status), deleted_at=NULL",
      [userId, item.slug, item.bio, item.city, workMode[item.mode] ?? "REMOTE", priceNumber(item.price), item.verified, item.verified ? "PUBLISHED" : "PENDING"],
    );
    await pool.execute(
      "INSERT INTO freelancer_skills (freelancer_profile_id, name) SELECT ?, ? WHERE NOT EXISTS (SELECT 1 FROM freelancer_skills WHERE freelancer_profile_id = ? AND name = ?)",
      [profileId, item.skill, profileId, item.skill],
    );
  }

  console.log(JSON.stringify({ seeded: true, education: education.length, services: services.length, products: products.length, freelancers: process.env.SEED_DEMO_FREELANCERS === "true" ? freelancers.length : 0 }, null, 2));
} finally {
  await pool.end();
}
