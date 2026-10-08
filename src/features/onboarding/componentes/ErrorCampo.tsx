export function ErrorCampo({ id, mensaje }: { id: string; mensaje?: string | null }) {
  if (!mensaje) return null;
  return (
    <p id={id} role="alert" className="text-sm text-error">
      {mensaje}
    </p>
  );
}
