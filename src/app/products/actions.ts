"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// ── Product Catalog (popular_vault_items) ────────────────

export async function createCatalogItemAction(data: {
  item_name: string;
  ingredient_list: string;
  selling_points: string[];
  packaging_ids: string[];
  accessory_ids: string[];
  how_to_use: string;
  moq: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("popular_vault_items").insert({
    user_id: user.id,
    item_name: data.item_name.trim(),
    ingredient_list: data.ingredient_list.trim(),
    selling_points: data.selling_points.filter((s) => s.trim()),
    packaging_ids: data.packaging_ids,
    accessory_ids: data.accessory_ids,
    how_to_use: data.how_to_use.trim(),
    moq: data.moq,
  } as never);

  if (error) {
    console.error("[catalog_item] insert error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function updateCatalogItemAction(id: string, data: {
  item_name: string;
  ingredient_list: string;
  selling_points: string[];
  packaging_ids: string[];
  accessory_ids: string[];
  how_to_use: string;
  moq: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("popular_vault_items")
    .update({
      item_name: data.item_name.trim(),
      ingredient_list: data.ingredient_list.trim(),
      selling_points: data.selling_points.filter((s) => s.trim()),
      packaging_ids: data.packaging_ids,
      accessory_ids: data.accessory_ids,
      how_to_use: data.how_to_use.trim(),
      moq: data.moq,
    } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[catalog_item] update error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function deleteCatalogItemAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("popular_vault_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[catalog_item] delete error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

// ── Packaging ─────────────────────────────────────────────

export async function createPackagingAction(data: { name: string; packaging_type: string; description: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("packaging_vault_items").insert({
    user_id: user.id,
    name: data.name.trim(),
    packaging_type: data.packaging_type.trim(),
    description: data.description.trim(),
  } as never);

  if (error) {
    console.error("[packaging] insert error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function updatePackagingAction(id: string, data: { name: string; packaging_type: string; description: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("packaging_vault_items")
    .update({
      name: data.name.trim(),
      packaging_type: data.packaging_type.trim(),
      description: data.description.trim(),
    } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[packaging] update error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function deletePackagingAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("packaging_vault_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[packaging] delete error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

// ── Accessories ───────────────────────────────────────────

export async function createAccessoryAction(data: { name: string; description: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("accessory_vault_items").insert({
    user_id: user.id,
    name: data.name.trim(),
    description: data.description.trim(),
  } as never);

  if (error) {
    console.error("[accessories] insert error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function updateAccessoryAction(id: string, data: { name: string; description: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("accessory_vault_items")
    .update({
      name: data.name.trim(),
      description: data.description.trim(),
    } as never)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[accessories] update error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}

export async function deleteAccessoryAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("accessory_vault_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[accessories] delete error:", error.message);
    return { error: error.message };
  }

  revalidatePath("/products");
  return { error: null };
}
