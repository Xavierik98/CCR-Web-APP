import { redirect } from "next/navigation";

// Le social s'ouvre sur les demandes de soutien ; les dossiers de séjour ont
// leur propre rubrique (/dossiers-sejour), à accès séparé.
export default function AccompagnementSocialPage() {
  redirect("/accompagnement-social/demandes");
}
