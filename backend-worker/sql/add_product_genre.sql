-- Store one or more genres per product, for example: ARRAY['Action', 'Comedy'].
ALTER TABLE public."Products"
ADD COLUMN IF NOT EXISTS "Genre" text[] NOT NULL DEFAULT ARRAY[]::text[];

CREATE INDEX IF NOT EXISTS "IX_Products_Genre"
ON public."Products" USING GIN ("Genre");