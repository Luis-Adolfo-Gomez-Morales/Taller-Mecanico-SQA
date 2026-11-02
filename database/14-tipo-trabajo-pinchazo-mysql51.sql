-- Conserva los tipos existentes y sus valores historicos.
USE taller_ttc;
ALTER TABLE ordenes_trabajo ADD COLUMN mano_pinchazo TINYINT(1) NOT NULL DEFAULT 0 AFTER mano_pintura;
