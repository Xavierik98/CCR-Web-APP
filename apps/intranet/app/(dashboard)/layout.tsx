// Coquille du tableau de bord (section 3). La navigation réelle entre modules et
// le filtrage par rôle arrivent avec l'authentification (section 7).

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
