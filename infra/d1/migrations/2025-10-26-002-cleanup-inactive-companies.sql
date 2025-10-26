-- Eliminar empresas inactivas para liberar los RUTs
-- Este script limpia las empresas con status INACTIVE para permitir
-- que los RUTs puedan ser reutilizados cuando se crea una nueva empresa

DELETE FROM companies WHERE status = 'INACTIVE';

-- Nota: Los workers y documentos relacionados se eliminarán automáticamente
-- debido a las constraints ON DELETE CASCADE definidas en la base de datos
