-- Base vacia para las pruebas. No incluye datos del taller.
SET FOREIGN_KEY_CHECKS=0;
CREATE TABLE `clientes` (
  `id_cliente` int(11) NOT NULL AUTO_INCREMENT,
  `tipo_persona` enum('Individual','Empresa') NOT NULL DEFAULT 'Individual',
  `nombre` varchar(150) NOT NULL,
  `dpi` varchar(30) DEFAULT NULL,
  `telefono` varchar(30) NOT NULL,
  `correo` varchar(120) DEFAULT NULL,
  `licencia` varchar(50) DEFAULT NULL,
  `tipo_licencia` varchar(10) DEFAULT NULL,
  `vence_licencia` date DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `contacto_empresa` varchar(150) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `fecha_creacion` datetime NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  PRIMARY KEY (`id_cliente`),
  UNIQUE KEY `uq_clientes_dpi` (`dpi`),
  KEY `idx_propietarios_nombre` (`nombre`),
  KEY `idx_propietarios_telefono` (`telefono`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `detalle_servicio` (
  `id_detalle_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `id_orden` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  `tipo_vehiculo` varchar(50) DEFAULT NULL,
  `fecha_realizado` datetime DEFAULT NULL,
  `kilometraje_servicio` decimal(12,2) NOT NULL,
  `trabajo_realizado` text,
  `observaciones` text,
  `nivel_uso` enum('Bajo','Normal','Alto') NOT NULL DEFAULT 'Normal',
  `fecha_proximo_servicio` date DEFAULT NULL,
  `estado_mantenimiento` enum('Pendiente','Realizado','Cancelado') NOT NULL DEFAULT 'Pendiente',
  `notificaciones_cliente` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_detalle_servicio`),
  KEY `idx_detalle_orden` (`id_orden`),
  KEY `idx_detalle_alertas` (`fecha_proximo_servicio`,`estado_mantenimiento`),
  KEY `fk_detalle_servicio` (`id_servicio`),
  CONSTRAINT `fk_detalle_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_trabajo` (`id_orden`) ON UPDATE CASCADE,
  CONSTRAINT `fk_detalle_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `historial_kilometraje` (
  `id_historial_kilometraje` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `id_orden` int(11) DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  `kilometraje` decimal(12,2) NOT NULL,
  `origen` enum('Registro de vehiculo','Ingreso a taller','Actualizacion') NOT NULL,
  `observaciones` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_historial_kilometraje`),
  KEY `idx_historial_vehiculo_fecha` (`id_vehiculo`,`fecha_registro`),
  KEY `idx_historial_orden` (`id_orden`),
  CONSTRAINT `fk_historial_orden` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_trabajo` (`id_orden`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_historial_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `inventario_repuestos` (
  `id_repuesto` int(11) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `existencia` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_repuesto`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `creado_por` (`creado_por`),
  CONSTRAINT `inventario_repuestos_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `mecanicos` (
  `id_mecanico` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `edad` int(11) NOT NULL,
  `dpi` varchar(30) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `fecha_contratacion` date NOT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id_mecanico`),
  UNIQUE KEY `uq_mecanicos_dpi` (`dpi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `modulos` (
  `id_modulo` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_modulo`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `orden_repuestos` (
  `id_orden_repuesto` int(11) NOT NULL AUTO_INCREMENT,
  `id_orden` int(11) NOT NULL,
  `id_repuesto` int(11) DEFAULT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(150) NOT NULL,
  `cantidad` decimal(10,2) NOT NULL DEFAULT '1.00',
  `cantidad_texto` varchar(30) DEFAULT NULL,
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00',
  `cantidad_descontada` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_orden_repuesto`),
  KEY `id_orden` (`id_orden`),
  KEY `id_repuesto` (`id_repuesto`),
  CONSTRAINT `orden_repuestos_ibfk_1` FOREIGN KEY (`id_orden`) REFERENCES `ordenes_trabajo` (`id_orden`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `orden_repuestos_ibfk_2` FOREIGN KEY (`id_repuesto`) REFERENCES `inventario_repuestos` (`id_repuesto`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `ordenes_trabajo` (
  `id_orden` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `serie` varchar(50) DEFAULT 'Serie A',
  `fecha_entrada` date NOT NULL,
  `hora_entrada` time NOT NULL,
  `periodo_entrada` enum('AM','PM') NOT NULL DEFAULT 'AM',
  `fecha_salida` date DEFAULT NULL,
  `hora_salida` time DEFAULT NULL,
  `periodo_salida` enum('AM','PM') DEFAULT 'PM',
  `vehiculo` varchar(150) DEFAULT NULL,
  `placa` varchar(20) NOT NULL,
  `id_vehiculo` int(11) DEFAULT NULL,
  `piloto` varchar(150) DEFAULT NULL,
  `marca` varchar(80) DEFAULT NULL,
  `mecanico` varchar(150) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `kilometraje` int(11) DEFAULT '0',
  `proximo_servicio` varchar(100) DEFAULT NULL,
  `tipo_vehiculo` varchar(50) DEFAULT NULL,
  `estado` enum('Abierta','Espera','Activa','En proceso','Finalizada','Entregado') NOT NULL DEFAULT 'Activa',
  `mano_mecanico` tinyint(1) NOT NULL DEFAULT '0',
  `mano_electronico` tinyint(1) NOT NULL DEFAULT '0',
  `mano_pintura` tinyint(1) NOT NULL DEFAULT '0',
  `mano_pinchazo` tinyint(1) NOT NULL DEFAULT '0',
  `total_mano_obra` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total_repuestos` decimal(10,2) NOT NULL DEFAULT '0.00',
  `trabajos` text,
  `observaciones` text,
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  `fecha_entrega` datetime DEFAULT NULL,
  `id_mecanico` int(11) DEFAULT NULL,
  `id_recepcion` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_orden`),
  UNIQUE KEY `uq_ordenes_numero_serie` (`numero`,`serie`),
  UNIQUE KEY `uq_orden_recepcion` (`id_recepcion`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_ordenes_placa` (`placa`),
  KEY `idx_ordenes_estado` (`estado`),
  KEY `idx_ordenes_fecha_entrada` (`fecha_entrada`),
  KEY `idx_ordenes_vehiculo` (`id_vehiculo`),
  KEY `idx_ordenes_mecanico` (`id_mecanico`),
  CONSTRAINT `fk_ordenes_mecanico` FOREIGN KEY (`id_mecanico`) REFERENCES `mecanicos` (`id_mecanico`) ON UPDATE CASCADE,
  CONSTRAINT `fk_ordenes_vehiculo` FOREIGN KEY (`id_vehiculo`) REFERENCES `vehiculos` (`id_vehiculo`) ON UPDATE CASCADE,
  CONSTRAINT `ordenes_trabajo_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `permisos` (
  `id_permiso` int(11) NOT NULL AUTO_INCREMENT,
  `id_modulo` int(11) NOT NULL,
  `accion` enum('ver','crear','editar','eliminar','exportar') NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id_permiso`),
  UNIQUE KEY `id_modulo` (`id_modulo`,`accion`),
  CONSTRAINT `permisos_ibfk_1` FOREIGN KEY (`id_modulo`) REFERENCES `modulos` (`id_modulo`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `recepcion_fotos` (
  `id_foto` int(11) NOT NULL AUTO_INCREMENT,
  `id_recepcion` int(11) NOT NULL,
  `archivo` varchar(80) NOT NULL,
  `imagen` longblob,
  `nombre` varchar(255) NOT NULL,
  `origen` varchar(15) NOT NULL,
  `creado_por` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id_foto`),
  UNIQUE KEY `uq_recepcion_foto_archivo` (`archivo`),
  KEY `idx_recepcion_fotos` (`id_recepcion`),
  CONSTRAINT `fk_foto_recepcion` FOREIGN KEY (`id_recepcion`) REFERENCES `recepciones` (`id_recepcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `recepciones` (
  `id_recepcion` int(11) NOT NULL AUTO_INCREMENT,
  `id_vehiculo` int(11) NOT NULL,
  `id_mecanico` int(11) DEFAULT NULL,
  `creado_por` int(11) NOT NULL,
  `fecha_ingreso` datetime NOT NULL,
  `placa` varchar(30) NOT NULL,
  `cliente` varchar(255) NOT NULL,
  `vehiculo` varchar(255) NOT NULL,
  `mecanico` varchar(150) DEFAULT NULL,
  `kilometraje` int(11) NOT NULL,
  `nivel_uso` varchar(10) NOT NULL,
  `combustible` varchar(10) NOT NULL,
  `espejos` tinyint(4) NOT NULL,
  `bateria` tinyint(4) NOT NULL,
  `documentos` tinyint(4) NOT NULL,
  `motivo` text NOT NULL,
  `observaciones` text NOT NULL,
  PRIMARY KEY (`id_recepcion`),
  KEY `idx_recepcion_vehiculo` (`id_vehiculo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `recordatorios` (
  `id_recordatorio` int(11) NOT NULL AUTO_INCREMENT,
  `id_detalle_servicio` int(11) NOT NULL,
  `tipo` enum('Proximo servicio','Servicio vencido','Segundo aviso') NOT NULL,
  `mensaje` text NOT NULL,
  `canal` enum('Interno','Correo','SMS','WhatsApp') NOT NULL DEFAULT 'Interno',
  `estado` enum('Generado','Enviado','Leido','Cancelado') NOT NULL DEFAULT 'Generado',
  `fecha_generacion` datetime NOT NULL,
  `fecha_envio` datetime DEFAULT NULL,
  PRIMARY KEY (`id_recordatorio`),
  UNIQUE KEY `uq_recordatorio_detalle_tipo` (`id_detalle_servicio`,`tipo`),
  KEY `idx_recordatorios_estado_fecha` (`estado`,`fecha_generacion`),
  CONSTRAINT `fk_recordatorios_detalle` FOREIGN KEY (`id_detalle_servicio`) REFERENCES `detalle_servicio` (`id_detalle_servicio`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `repuestos_movimientos` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_repuesto` int(11) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `tipo` enum('Ingreso','Salida') NOT NULL,
  `cantidad` decimal(10,2) NOT NULL,
  `existencia_anterior` decimal(10,2) NOT NULL DEFAULT '0.00',
  `existencia_nueva` decimal(10,2) NOT NULL DEFAULT '0.00',
  `precio_unitario` decimal(10,2) NOT NULL DEFAULT '0.00',
  `referencia` varchar(120) DEFAULT NULL,
  `observaciones` text,
  `fecha_movimiento` datetime NOT NULL,
  PRIMARY KEY (`id_movimiento`),
  KEY `idx_repuestos_movimientos_repuesto` (`id_repuesto`),
  KEY `idx_repuestos_movimientos_tipo_fecha` (`tipo`,`fecha_movimiento`),
  CONSTRAINT `fk_repuestos_movimientos_repuesto` FOREIGN KEY (`id_repuesto`) REFERENCES `inventario_repuestos` (`id_repuesto`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `rol_permisos` (
  `id_rol` int(11) NOT NULL,
  `id_permiso` int(11) NOT NULL,
  PRIMARY KEY (`id_rol`,`id_permiso`),
  KEY `id_permiso` (`id_permiso`),
  CONSTRAINT `rol_permisos_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `rol_permisos_ibfk_2` FOREIGN KEY (`id_permiso`) REFERENCES `permisos` (`id_permiso`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(80) NOT NULL,
  `descripcion` varchar(150) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `servicios` (
  `id_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text,
  `tipo` enum('Preventivo','Correctivo') NOT NULL DEFAULT 'Preventivo',
  `id_tipo_trabajo` int(11) NOT NULL DEFAULT '1',
  `tipo_vehiculo` enum('Todos','Camion','Pickup','Panel','Cabezal','Moto','Sedan','Camioneta','Cerrado','Otros') NOT NULL DEFAULT 'Todos',
  `intervalo_dias_normal` smallint(6) DEFAULT NULL,
  `intervalo_km_referencial` int(11) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  PRIMARY KEY (`id_servicio`),
  UNIQUE KEY `uq_servicios_nombre` (`nombre`),
  KEY `idx_servicios_tipo_trabajo` (`id_tipo_trabajo`),
  CONSTRAINT `fk_servicios_tipo_trabajo` FOREIGN KEY (`id_tipo_trabajo`) REFERENCES `tipos_trabajo` (`id_tipo_trabajo`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `servicios_tipos_vehiculo` (
  `id_servicio` int(11) NOT NULL,
  `tipo_vehiculo` varchar(50) NOT NULL,
  PRIMARY KEY (`id_servicio`,`tipo_vehiculo`),
  KEY `idx_servicios_tipo_vehiculo` (`tipo_vehiculo`),
  CONSTRAINT `fk_servicios_tipos_servicio` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_servicios_tipos_tipo` FOREIGN KEY (`tipo_vehiculo`) REFERENCES `tipos_vehiculo` (`tipo`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tipos_trabajo` (
  `id_tipo_trabajo` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_tipo_trabajo`),
  UNIQUE KEY `uq_tipos_trabajo_nombre` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tipos_vehiculo` (
  `tipo` varchar(50) NOT NULL,
  PRIMARY KEY (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `usuario_roles` (
  `id_usuario` int(11) NOT NULL,
  `id_rol` int(11) NOT NULL,
  PRIMARY KEY (`id_usuario`,`id_rol`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuario_roles_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usuario_roles_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellido` varchar(100) NOT NULL DEFAULT '',
  `rol` enum('Administrador','Empleado') NOT NULL DEFAULT 'Empleado',
  `correo` varchar(120) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  `estado` enum('Activo','Inactivo') NOT NULL DEFAULT 'Activo',
  `ultimo_acceso` datetime DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `vehiculos` (
  `id_vehiculo` int(11) NOT NULL AUTO_INCREMENT,
  `placa` varchar(20) NOT NULL,
  `nit` varchar(30) DEFAULT NULL,
  `cui` varchar(30) DEFAULT NULL,
  `propietario` varchar(150) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `uso` varchar(50) DEFAULT NULL,
  `nivel_uso` enum('Bajo','Normal','Alto') NOT NULL DEFAULT 'Normal',
  `tipo` varchar(50) DEFAULT NULL,
  `marca` varchar(80) DEFAULT NULL,
  `linea` varchar(80) DEFAULT NULL,
  `modelo` varchar(100) DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `chasis` varchar(80) DEFAULT NULL,
  `serie` varchar(80) DEFAULT NULL,
  `vin` varchar(80) DEFAULT NULL,
  `motor` varchar(80) DEFAULT NULL,
  `asientos` int(11) DEFAULT '0',
  `ejes` int(11) DEFAULT '0',
  `cilindros` int(11) DEFAULT '0',
  `cc` int(11) DEFAULT '0',
  `tonelaje` decimal(10,2) DEFAULT '0.00',
  `kilometraje` int(11) DEFAULT '0',
  `estado` enum('Activo','En taller','Inactivo') NOT NULL DEFAULT 'Activo',
  `creado_por` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `fecha_actualizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_vehiculo`),
  UNIQUE KEY `placa` (`placa`),
  KEY `creado_por` (`creado_por`),
  KEY `idx_vehiculos_placa` (`placa`),
  KEY `idx_vehiculos_cliente` (`id_cliente`),
  KEY `fk_vehiculos_tipo` (`tipo`),
  CONSTRAINT `fk_vehiculos_cliente` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`) ON UPDATE CASCADE,
  CONSTRAINT `fk_vehiculos_tipo` FOREIGN KEY (`tipo`) REFERENCES `tipos_vehiculo` (`tipo`) ON UPDATE CASCADE,
  CONSTRAINT `vehiculos_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `usuarios` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS=1;
CREATE ALGORITHM=UNDEFINED SQL SECURITY INVOKER VIEW `vw_mantenimientos_alerta` AS select `ds`.`id_detalle_servicio` AS `id_detalle_servicio`,`v`.`id_vehiculo` AS `id_vehiculo`,`v`.`placa` AS `placa`,`v`.`propietario` AS `propietario`,`s`.`nombre` AS `servicio`,`ds`.`fecha_proximo_servicio` AS `fecha_proximo_servicio`,(case when (`ds`.`fecha_proximo_servicio` < curdate()) then 'Vencido' when (`ds`.`fecha_proximo_servicio` <= (curdate() + interval 7 day)) then 'Proximo' else 'Programado' end) AS `estado_alerta` from ((((`detalle_servicio` `ds` join `ordenes_trabajo` `o` on((`o`.`id_orden` = `ds`.`id_orden`))) join `vehiculos` `v` on((`v`.`id_vehiculo` = `o`.`id_vehiculo`))) left join `clientes` `c` on((`c`.`id_cliente` = `v`.`id_cliente`))) join `servicios` `s` on((`s`.`id_servicio` = `ds`.`id_servicio`))) where ((`ds`.`estado_mantenimiento` = 'Realizado') and (`ds`.`fecha_proximo_servicio` is not null) and (not(exists(select 1 AS `1` from (`detalle_servicio` `nuevo` join `ordenes_trabajo` `otra` on((`otra`.`id_orden` = `nuevo`.`id_orden`))) where ((`otra`.`id_vehiculo` = `o`.`id_vehiculo`) and (`nuevo`.`id_servicio` = `ds`.`id_servicio`) and (`nuevo`.`estado_mantenimiento` = 'Realizado') and ((`nuevo`.`fecha_realizado` > `ds`.`fecha_realizado`) or ((`nuevo`.`fecha_realizado` = `ds`.`fecha_realizado`) and (`nuevo`.`id_detalle_servicio` > `ds`.`id_detalle_servicio`))))))));
