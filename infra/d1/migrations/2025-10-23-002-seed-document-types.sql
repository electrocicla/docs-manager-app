-- Insertar tipos de documentos requeridos
INSERT INTO worker_document_types (id, code, name, description, requires_front_back, requires_expiry_date, order_index)
VALUES
  ('doc_type_1', 'CEDULA', 'Cédula de Identidad', 'Documento de identidad con frente y dorso', 1, 1, 1),
  ('doc_type_2', 'CONTRATO', 'Contrato de Trabajo', 'Contrato laboral vigente del trabajador', 0, 0, 2),
  ('doc_type_3', 'DS_44', 'Información Riesgos Laborales DS 44', 'DS 44 - IRL CONTRATISTA (EX ODI)', 0, 1, 3),
  ('doc_type_4', 'RIOHS', 'Registro Entrega de RIOHS', 'Comprobante entrega RIOHS al trabajador', 0, 1, 4),
  ('doc_type_5', 'EPP', 'Registro Entrega de EPP', 'Comprobante entrega de Equipo de Protección Personal', 0, 1, 5);
