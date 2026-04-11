/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `exhibitor_id` (uuid, foreign key to exhibitors)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `images` (text array)
      - `specifications` (text, nullable)
      - `price` (numeric, nullable)
      - `featured` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policies for public read access
    - Add policies for exhibitors to manage their own products
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  images text[] DEFAULT '{}',
  specifications text,
  price numeric,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Exhibitors can manage own products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exhibitors e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = products.exhibitor_id 
      AND auth.uid()::text = u.id::text
    )
  );

CREATE POLICY "Admins can manage all products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND type = 'admin'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();