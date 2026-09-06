export default function LabPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8">
      <h1 className="text-xl font-semibold text-[#0b1f3a]">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">Module prévu — checkpoint suivant.</p>
    </div>
  );
}

export function LabClientHomePage() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-[#0b1f3a]">Vos dossiers</h1>
      <p className="mt-2 text-sm text-slate-500">Demandes, devis, rapports et factures seront listés ici.</p>
    </div>
  );
}
