export function alternarId(seleccionadas: Set<string>, id: string): Set<string> {
  const siguiente = new Set(seleccionadas);
  if (siguiente.has(id)) siguiente.delete(id);
  else siguiente.add(id);
  return siguiente;
}

export function estadoSeleccionTodas(visibles: { id: string }[], seleccionadas: Set<string>): 'ninguna' | 'algunas' | 'todas' {
  const seleccionadasVisibles = visibles.filter((v) => seleccionadas.has(v.id)).length;
  if (seleccionadasVisibles === 0) return 'ninguna';
  return seleccionadasVisibles === visibles.length ? 'todas' : 'algunas';
}

// "Seleccionar todas" actúa solo sobre lo que se está mostrando (respeta los filtros activos).
export function alternarTodas(visibles: { id: string }[], seleccionadas: Set<string>): Set<string> {
  const siguiente = new Set(seleccionadas);
  if (estadoSeleccionTodas(visibles, seleccionadas) === 'todas') {
    for (const v of visibles) siguiente.delete(v.id);
  } else {
    for (const v of visibles) siguiente.add(v.id);
  }
  return siguiente;
}

export function idsSeleccionadosVisibles(visibles: { id: string }[], seleccionadas: Set<string>): string[] {
  return visibles.filter((v) => seleccionadas.has(v.id)).map((v) => v.id);
}
