// Section 2.A du cahier des charges. Formulaire affiche seulement : la verification
// des identifiants, la gestion de session et le verrouillage apres echecs repetes
// restent a cabler avec Supabase Auth (decision du 25/11, section 7).

export default function LoginPage() {
  return (
    <main>
      <h1>Connexion</h1>
      <form>
        <label htmlFor="email">Identifiant ou e-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" />
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
        />
        <button type="submit">Se connecter</button>
      </form>
    </main>
  );
}
