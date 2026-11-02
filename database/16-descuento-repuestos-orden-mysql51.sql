USE taller_ttc;
-- Las lineas anteriores no descontaron inventario: no devolver cantidades no descontadas.
ALTER TABLE orden_repuestos ADD COLUMN cantidad_descontada DECIMAL(10,2) NOT NULL DEFAULT 0;
