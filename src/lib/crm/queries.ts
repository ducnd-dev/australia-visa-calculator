import { createClient } from "@/lib/supabase/server";
import {
  attentionItemHref,
  type AttentionItem,
  type AttentionItemType,
  type AttentionPriority,
} from "./attention-items";

type RpcRow = {
  item_type: string;
  priority: string;
  client_id: string;
  client_name: string;
  assessment_id: string | null;
  message: string;
};

export async function fetchAttentionItems(organizationId: string, limit = 8): Promise<AttentionItem[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase.rpc("get_attention_items", {
    p_org_id: organizationId,
    p_limit: limit,
  });

  if (error || !data) return [];

  return (data as RpcRow[]).map((row) => {
    const itemType = row.item_type as AttentionItemType;
    return {
      itemType,
      priority: row.priority as AttentionPriority,
      clientId: row.client_id,
      clientName: row.client_name,
      assessmentId: row.assessment_id,
      message: row.message,
      href: attentionItemHref(row.client_id, row.assessment_id, itemType),
    };
  });
}
