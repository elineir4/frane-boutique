ALTER TABLE public.productos
ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'productos_stock_no_negativo'
      AND conrelid = 'public.productos'::regclass
  ) THEN
    ALTER TABLE public.productos
    ADD CONSTRAINT productos_stock_no_negativo CHECK (stock >= 0);
  END IF;
END
$$;
