export default function PrivacyPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-1 flex-col gap-4 p-4">
      <h1 className="text-lg font-semibold">Confidentialité</h1>
      <p className="text-xs text-muted-foreground">Dernière mise à jour : 3 août 2026</p>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Ce que nous collectons</h2>
        <p className="text-sm text-muted-foreground">
          Cette application ne demande ni compte ni nom ni e-mail. La session créée après
          connexion ne contient qu&apos;un indicateur de connexion, rien qui vous identifie.
        </p>
        <p className="text-sm text-muted-foreground">
          Votre adresse IP est traitée brièvement pour limiter le nombre de tentatives de mot de
          passe (au maximum 5 par minute), afin d&apos;éviter les abus.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Ce que vous soumettez</h2>
        <p className="text-sm text-muted-foreground">
          Les informations d&apos;accessibilité que vous renseignez concernent des lieux, jamais
          des personnes. Aucune attribution ni identité n&apos;est associée à vos contributions.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Hébergement et sous-traitants</h2>
        <p className="text-sm text-muted-foreground">
          Cette application est hébergée sur{" "}
          <a
            href="https://vercel.com/legal/privacy-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Vercel
          </a>
          . L&apos;API et la base de données sont hébergées séparément sur{" "}
          <a
            href="https://fly.io/legal/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Fly.io
          </a>{" "}
          et{" "}
          <a
            href="https://supabase.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Supabase
          </a>
          . La limitation des tentatives de connexion utilise{" "}
          <a
            href="https://upstash.com/trust/privacy.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Upstash
          </a>{" "}
          Redis.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Conservation</h2>
        <p className="text-sm text-muted-foreground">
          Le cookie de session expire après 5 ans ou à la déconnexion. Les données de limitation
          de tentatives sont conservées environ une minute.
        </p>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">Contact</h2>
        <p className="text-sm text-muted-foreground">
          Pour toute question ou demande de suppression de données, contactez{" "}
          <a href="mailto:info@inwheel.org" className="underline">
            info@inwheel.org
          </a>
          .
        </p>
      </section>
    </main>
  );
}
