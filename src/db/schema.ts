import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createId } from "@/lib/id";

export const productStatus = pgEnum("product_status", [
  "AVAILABLE",
  "SOLD_OUT",
]);
export const tierType = pgEnum("tier_type", ["FIXED_PRICE", "PERCENT_OFF"]);

const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => createId());

const createdAt = () => timestamp("created_at").defaultNow().notNull();
const updatedAt = () =>
  timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date());

export const categories = pgTable("categories", {
  id: id(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const products = pgTable(
  "products",
  {
    id: id(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    categoryId: text("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
    status: productStatus("status").notNull().default("AVAILABLE"),
    featured: boolean("featured").notNull().default(false),
    onSale: boolean("on_sale").notNull().default(false),
    salePrice: numeric("sale_price", { precision: 10, scale: 2 }),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("products_category_idx").on(t.categoryId)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const priceTiers = pgTable(
  "price_tiers",
  {
    id: id(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    minQty: integer("min_qty").notNull(),
    maxQty: integer("max_qty"),
    type: tierType("type").notNull().default("FIXED_PRICE"),
    value: numeric("value", { precision: 10, scale: 2 }).notNull(),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("price_tiers_product_idx").on(t.productId)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: updatedAt(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  priceTiers: many(priceTiers),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const priceTiersRelations = relations(priceTiers, ({ one }) => ({
  product: one(products, {
    fields: [priceTiers.productId],
    references: [products.id],
  }),
}));
