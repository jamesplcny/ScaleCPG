-- UPS Shipments table
-- Stores label request data when manufacturer responds to a UPS order

CREATE TABLE ups_shipments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  client_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  box_length NUMERIC NOT NULL,
  box_width NUMERIC NOT NULL,
  box_height NUMERIC NOT NULL,
  box_weight NUMERIC NOT NULL,
  units_per_box INTEGER NOT NULL,
  num_boxes INTEGER NOT NULL,
  requested_date TEXT NOT NULL,
  label_requested_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE ups_shipments ENABLE ROW LEVEL SECURITY;

-- Manufacturer can read/insert their own UPS shipments
CREATE POLICY "manufacturer manages ups_shipments"
  ON ups_shipments FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
