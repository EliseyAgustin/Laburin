-- Laburin — a lo sumo un recordatorio activo por postulación
-- generarRecordatorios() corre del lado del cliente; si dos pestañas lo ejecutan a la vez, este índice
-- impide que se dupliquen. Los recordatorios resueltos no cuentan: puede haber varios por postulación.

create unique index recordatorios_un_activo_por_postulacion_idx
  on public.recordatorios (postulacion_id)
  where estado = 'activo';
