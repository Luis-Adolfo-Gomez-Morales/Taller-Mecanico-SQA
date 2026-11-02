USE taller_ttc;
CREATE TABLE IF NOT EXISTS mecanicos (
 id_mecanico INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
 nombre VARCHAR(150) NOT NULL, edad INT NOT NULL, dpi VARCHAR(30) NOT NULL,
 correo VARCHAR(150) NOT NULL, direccion VARCHAR(255) NOT NULL,
 fecha_contratacion DATE NOT NULL, fecha_registro DATETIME NOT NULL,
 UNIQUE KEY uq_mecanicos_dpi (dpi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
ALTER TABLE ordenes_trabajo ADD COLUMN id_mecanico INT NULL,
 ADD KEY idx_ordenes_mecanico (id_mecanico),
 ADD CONSTRAINT fk_ordenes_mecanico FOREIGN KEY (id_mecanico) REFERENCES mecanicos(id_mecanico) ON DELETE RESTRICT ON UPDATE CASCADE;
