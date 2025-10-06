export interface Movement {
  id: string;
  movementType: string;
  quantity: number;
  reasonText?: string;
  referenceText?: string;
  notes?: string;
  itemId?: string;
  userId?: string;
  item?: { id: string; name: string; sku: string };
  user?: { id: string; name: string };
}

export interface MovementInput {
  movementType: string;
  quantity: number;
  reasonText?: string;
  referenceText?: string;
  notes?: string;
  itemId: string;
  userId: string;
}