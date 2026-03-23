"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function placeClientOrderAction(data: {
  clientId: string;
  clientName: string;
  manufacturerId: string;
  productName: string;
  quantity: number;
  shipmentType: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/client/login");

  // Server-side verification: fetch real client_users row
  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_id, manufacturer_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!clientUser) redirect("/client/login");

  // Count existing orders for order number
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const orderNum = String((count ?? 0) + 1).padStart(3, "0");

  const today = new Date();
  const requestedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const { error } = await supabase.from("orders").insert({
    user_id: clientUser.manufacturer_id,
    client_id: clientUser.client_id,
    order_number: `REQ-${orderNum}`,
    client_name: data.clientName,
    product_name: data.productName,
    quantity: data.quantity,
    shipment_type: data.shipmentType,
    status: "pending",
    requested_date: requestedDate,
    requested_due_date: null,
    ups_labels_uploaded: false,
    delay_note: null,
    brand_id: null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/client/dashboard");
}
