import { useRef, useState } from 'react';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { Button } from '../../ui/Button';
import type {
  SalonPartnerCmsEntry,
  SalonPartnerCmsGroup,
  SalonPartnersCms,
} from '../../../config/mobileAppDefaultContent';
import { APK_DEFAULT_SALON_PARTNERS } from '../../../config/mobileAppDefaultContent';

type Props = {
  salonKey: string;
  value: SalonPartnersCms;
  onChange: (next: SalonPartnersCms) => void;
  onUploadLogo: (slot: string, file: File) => Promise<string>;
};

const inputClass =
  'w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 px-3 py-2 text-sm';

export function SalonPartnersEditor({ salonKey, value, onChange, onUploadLogo }: Props) {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const groups = value.groups ?? [];

  const patch = (nextGroups: SalonPartnerCmsGroup[]) => {
    onChange({ ...value, displayMode: 'list', groups: nextGroups });
  };

  const updateGroupLabel = (groupIndex: number, label: string) => {
    const next = groups.map((g, i) => (i === groupIndex ? { ...g, label } : g));
    patch(next);
  };

  const updatePartner = (
    groupIndex: number,
    partnerIndex: number,
    field: keyof SalonPartnerCmsEntry,
    fieldValue: string,
  ) => {
    const next = groups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      const partners = g.partners.map((p, pi) =>
        pi === partnerIndex ? { ...p, [field]: fieldValue } : p,
      );
      return { ...g, partners };
    });
    patch(next);
  };

  const removePartner = (groupIndex: number, partnerIndex: number) => {
    const next = groups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      return { ...g, partners: g.partners.filter((_, pi) => pi !== partnerIndex) };
    });
    patch(next);
  };

  const addPartner = (groupIndex: number) => {
    const next = groups.map((g, gi) => {
      if (gi !== groupIndex) return g;
      return {
        ...g,
        partners: [...g.partners, { name: '', acronym: '' }],
      };
    });
    patch(next);
  };

  const addCategory = () => {
    patch([
      ...groups,
      { label: 'Nouvelle catégorie', partners: [{ name: '', acronym: '' }] },
    ]);
  };

  const removeCategory = (groupIndex: number) => {
    patch(groups.filter((_, i) => i !== groupIndex));
  };

  const loadDefaults = () => {
    onChange({
      displayMode: 'list',
      groups: JSON.parse(JSON.stringify(APK_DEFAULT_SALON_PARTNERS[salonKey]?.groups ?? [])) as SalonPartnerCmsGroup[],
    });
  };

  const handleLogoUpload = async (groupIndex: number, partnerIndex: number, file: File) => {
    const id = `${groupIndex}-${partnerIndex}`;
    setUploadingId(id);
    try {
      const slot = `partner-${salonKey}-${groupIndex}-${partnerIndex}`;
      const url = await onUploadLogo(slot, file);
      onChange({
        ...value,
        displayMode: 'list',
        groups: groups.map((g, gi) => {
          if (gi !== groupIndex) return g;
          return {
            ...g,
            partners: g.partners.map((p, pi) =>
              pi === partnerIndex ? { ...p, logoUrl: url } : p,
            ),
          };
        }),
      });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-950/30 p-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" type="button" onClick={addCategory}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter une catégorie
        </Button>
        <Button variant="outline" size="sm" type="button" onClick={loadDefaults}>
          Charger les sponsors par défaut
        </Button>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4 text-center">
          Aucun sponsor. Cliquez sur « Ajouter une catégorie » ou chargez les sponsors par défaut.
        </p>
      ) : (
        groups.map((group, groupIndex) => (
          <div
            key={`${salonKey}-group-${groupIndex}`}
            className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-end gap-2">
              <label className="flex-1 min-w-[200px]">
                <span className="text-xs text-neutral-500 mb-1 block">Catégorie</span>
                <input
                  type="text"
                  value={group.label}
                  onChange={(e) => updateGroupLabel(groupIndex, e.target.value)}
                  className={inputClass}
                  placeholder="Ex. Sponsor officiel"
                />
              </label>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => removeCategory(groupIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {group.partners.map((partner, partnerIndex) => {
                const uploadKey = `${groupIndex}-${partnerIndex}`;
                return (
                  <div
                    key={`${group.label}-${partnerIndex}`}
                    className="grid gap-2 md:grid-cols-[1fr_100px_80px_auto] items-end rounded-lg border border-neutral-100 dark:border-neutral-800 p-3"
                  >
                    <label className="block md:col-span-1">
                      <span className="text-xs text-neutral-500 mb-1 block">Nom du sponsor</span>
                      <input
                        type="text"
                        value={partner.name}
                        onChange={(e) => updatePartner(groupIndex, partnerIndex, 'name', e.target.value)}
                        className={inputClass}
                        placeholder="Raison sociale"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs text-neutral-500 mb-1 block">Sigle</span>
                      <input
                        type="text"
                        value={partner.acronym}
                        onChange={(e) => updatePartner(groupIndex, partnerIndex, 'acronym', e.target.value)}
                        className={inputClass}
                        placeholder="ABC"
                      />
                    </label>
                    <div className="block">
                      <span className="text-xs text-neutral-500 mb-1 block">Logo</span>
                      {partner.logoUrl ? (
                        <img
                          src={partner.logoUrl}
                          alt={partner.acronym}
                          className="h-10 w-full object-contain rounded border border-neutral-200 mb-1"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <input
                        ref={(el) => { fileRefs.current[uploadKey] = el; }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) void handleLogoUpload(groupIndex, partnerIndex, file);
                          e.target.value = '';
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        className="w-full"
                        disabled={uploadingId === uploadKey}
                        onClick={() => fileRefs.current[uploadKey]?.click()}
                      >
                        {uploadingId === uploadKey ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="text-red-600"
                      onClick={() => removePartner(groupIndex, partnerIndex)}
                      title="Supprimer ce sponsor"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>

            <Button variant="primary" size="sm" type="button" onClick={() => addPartner(groupIndex)}>
              <Plus className="h-4 w-4 mr-1" />
              Ajouter un sponsor
            </Button>
          </div>
        ))
      )}
    </div>
  );
}
