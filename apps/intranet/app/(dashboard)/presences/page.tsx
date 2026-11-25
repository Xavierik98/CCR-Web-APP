// Module Présences (section 3) : création d'événements et pointage, modèle
// événement + présence détaillé en section 4 du cahier des charges.
// Décision du 26/11, à partir du fichier de suivi papier/Excel fourni : le
// pointage se fait par scan du QR code personnel du membre (Member.qrToken,
// voir @ccr/database) ou manuellement ; le nombre de présents par culte est
// toujours recalculé à la demande (getAttendanceSummary), jamais stocké.
// Reste à câbler une fois Supabase connecté : page de scan publique (lecture
// de QR via la caméra), tableau de bord par culte, et génération + envoi du
// rapport (formatAttendanceReportMessage) sur un canal encore à choisir avec
// le client (WhatsApp ou e-mail).

export default function PresencesPage() {
  return (
    <main>
      <h1>Présences</h1>
    </main>
  );
}
