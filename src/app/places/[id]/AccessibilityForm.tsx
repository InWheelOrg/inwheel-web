"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, type Control, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  ACCESSIBILITY_SECTIONS,
  type AccessibilityProfile,
  type AccessibilitySection,
} from "@/lib/place-types";
import { submitAccessibilityPatch } from "./actions";

const level = z.enum(["good", "limited", "no"]).optional();
const doorSchema = z
  .object({
    type: z.enum(["automatic", "manual", "revolving", "none"]).optional(),
    width: level,
  })
  .optional();

const formSchema = z.object({
  entrance: z
    .object({
      is_level: z.boolean().optional(),
      has_fixed_ramp: z.boolean().optional(),
      has_removable_ramp: z.boolean().optional(),
      slope_percent: level,
      width: level,
      door: doorSchema,
      has_intercom: z.boolean().optional(),
    })
    .optional(),
  pathways: z
    .object({
      width: level,
      surface: z
        .enum([
          "asphalt",
          "paving_stones",
          "cobblestone",
          "gravel",
          "concrete",
          "wood",
          "carpet",
          "tiles",
        ])
        .optional(),
      is_kerbstone_free: z.boolean().optional(),
      has_steps: z.boolean().optional(),
    })
    .optional(),
  restroom: z
    .object({
      is_accessible: z.boolean().optional(),
      door_width: level,
      turning_radius: level,
      has_grab_rails: z.boolean().optional(),
      has_roll_in_shower: z.boolean().optional(),
      toilet_seat_height: level,
      has_emergency_pull: z.boolean().optional(),
      has_changing_table: z.boolean().optional(),
    })
    .optional(),
  parking: z
    .object({
      has_disabled_spaces: z.boolean().optional(),
      count: z.number().min(0).max(10000).optional(),
      distance_to_entrance: level,
      width: level,
      has_dedicated_signage: z.boolean().optional(),
    })
    .optional(),
  elevator: z
    .object({
      width: level,
      depth: level,
      door_width: level,
      has_braille: z.boolean().optional(),
      has_audio: z.boolean().optional(),
    })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

const SECTION_LABELS: Record<AccessibilitySection, string> = {
  entrance: "Entrée",
  pathways: "Cheminements",
  restroom: "Toilettes",
  parking: "Parking",
  elevator: "Ascenseur",
};

const SURFACE_LABELS: Record<string, string> = {
  asphalt: "Asphalte",
  paving_stones: "Dalles",
  cobblestone: "Pavés",
  gravel: "Gravier",
  concrete: "Béton",
  wood: "Bois",
  carpet: "Moquette",
  tiles: "Carrelage",
};

const DOOR_TYPE_LABELS: Record<string, string> = {
  automatic: "Automatique",
  manual: "Manuelle",
  revolving: "Tambour",
  none: "Aucune",
};

function LevelField({
  control,
  name,
  label,
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between gap-2">
          <Label>{label}</Label>
          <ToggleGroup
            value={field.value ? [field.value as string] : []}
            onValueChange={(v) => field.onChange(v[0])}
          >
            <ToggleGroupItem value="good">Bon</ToggleGroupItem>
            <ToggleGroupItem value="limited">Limité</ToggleGroupItem>
            <ToggleGroupItem value="no">Non</ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}
    />
  );
}

function BoolField({
  control,
  name,
  label,
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const current = field.value === true ? "yes" : field.value === false ? "no" : undefined;
        return (
          <div className="flex items-center justify-between gap-2">
            <Label>{label}</Label>
            <ToggleGroup
              value={current ? [current] : []}
              onValueChange={(v) => field.onChange(v[0] === "yes" ? true : v[0] === "no" ? false : undefined)}
            >
              <ToggleGroupItem value="yes">Oui</ToggleGroupItem>
              <ToggleGroupItem value="no">Non</ToggleGroupItem>
            </ToggleGroup>
          </div>
        );
      }}
    />
  );
}

function EnumField({
  control,
  name,
  label,
  options,
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
  options: Record<string, string>;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between gap-2">
          <Label>{label}</Label>
          <Select
            value={(field.value as string) ?? null}
            onValueChange={(v) => field.onChange(v ?? undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(options).map(([value, optionLabel]) => (
                <SelectItem key={value} value={value}>
                  {optionLabel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    />
  );
}

function NumberField({
  control,
  name,
  label,
}: {
  control: Control<FormValues>;
  name: FieldPath<FormValues>;
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type="number"
            min={0}
            max={10000}
            className="w-24"
            value={field.value === undefined || field.value === null ? "" : String(field.value)}
            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          />
        </div>
      )}
    />
  );
}

export function AccessibilityForm({
  placeId,
  profile,
}: {
  placeId: string;
  profile: AccessibilityProfile;
}) {
  const router = useRouter();
  const [nulledSections, setNulledSections] = useState<Set<AccessibilitySection>>(
    () => new Set(ACCESSIBILITY_SECTIONS.filter((section) => profile[section] === null)),
  );

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entrance: profile.entrance ?? undefined,
      pathways: profile.pathways ?? undefined,
      restroom: profile.restroom ?? undefined,
      parking: profile.parking ?? undefined,
      elevator: profile.elevator ?? undefined,
    },
  });

  function toggleSection(section: AccessibilitySection, doesNotApply: boolean) {
    setNulledSections((prev) => {
      const next = new Set(prev);
      if (doesNotApply) next.add(section);
      else next.delete(section);
      return next;
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    const patch: Record<string, unknown> = { ...values };
    for (const section of nulledSections) {
      patch[section] = null;
    }

    const result = await submitAccessibilityPatch(placeId, patch);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Modifications enregistrées.");
    router.push("/");
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Accordion defaultValue={[...ACCESSIBILITY_SECTIONS]}>
        {ACCESSIBILITY_SECTIONS.map((section) => {
          const doesNotApply = nulledSections.has(section);
          return (
            <AccordionItem key={section} value={section}>
              <AccordionTrigger>{SECTION_LABELS[section]}</AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center justify-between pb-3">
                  <Label htmlFor={`${section}-na`}>Ne s&apos;applique pas</Label>
                  <Switch
                    id={`${section}-na`}
                    checked={doesNotApply}
                    onCheckedChange={(checked) => toggleSection(section, checked)}
                  />
                </div>
                <fieldset disabled={doesNotApply} className="flex flex-col gap-3 disabled:opacity-50">
                  {section === "entrance" && (
                    <>
                      <BoolField control={control} name="entrance.is_level" label="De plain-pied" />
                      <BoolField control={control} name="entrance.has_fixed_ramp" label="Rampe fixe" />
                      <BoolField control={control} name="entrance.has_removable_ramp" label="Rampe amovible" />
                      <LevelField control={control} name="entrance.slope_percent" label="Pente" />
                      <LevelField control={control} name="entrance.width" label="Largeur" />
                      <EnumField
                        control={control}
                        name="entrance.door.type"
                        label="Type de porte"
                        options={DOOR_TYPE_LABELS}
                      />
                      <LevelField control={control} name="entrance.door.width" label="Largeur de porte" />
                      <BoolField control={control} name="entrance.has_intercom" label="Interphone" />
                    </>
                  )}
                  {section === "pathways" && (
                    <>
                      <LevelField control={control} name="pathways.width" label="Largeur" />
                      <EnumField
                        control={control}
                        name="pathways.surface"
                        label="Revêtement"
                        options={SURFACE_LABELS}
                      />
                      <BoolField control={control} name="pathways.is_kerbstone_free" label="Sans bordure" />
                      <BoolField control={control} name="pathways.has_steps" label="Marches" />
                    </>
                  )}
                  {section === "restroom" && (
                    <>
                      <BoolField control={control} name="restroom.is_accessible" label="Accessible" />
                      <LevelField control={control} name="restroom.door_width" label="Largeur de porte" />
                      <LevelField control={control} name="restroom.turning_radius" label="Rayon de giration" />
                      <BoolField control={control} name="restroom.has_grab_rails" label="Barres d'appui" />
                      <BoolField control={control} name="restroom.has_roll_in_shower" label="Douche accessible" />
                      <LevelField control={control} name="restroom.toilet_seat_height" label="Hauteur de la cuvette" />
                      <BoolField control={control} name="restroom.has_emergency_pull" label="Cordon d'alarme" />
                      <BoolField control={control} name="restroom.has_changing_table" label="Table à langer" />
                    </>
                  )}
                  {section === "parking" && (
                    <>
                      <BoolField control={control} name="parking.has_disabled_spaces" label="Places handicap" />
                      <NumberField control={control} name="parking.count" label="Nombre de places" />
                      <LevelField control={control} name="parking.distance_to_entrance" label="Distance à l'entrée" />
                      <LevelField control={control} name="parking.width" label="Largeur des places" />
                      <BoolField control={control} name="parking.has_dedicated_signage" label="Signalétique dédiée" />
                    </>
                  )}
                  {section === "elevator" && (
                    <>
                      <LevelField control={control} name="elevator.width" label="Largeur de cabine" />
                      <LevelField control={control} name="elevator.depth" label="Profondeur de cabine" />
                      <LevelField control={control} name="elevator.door_width" label="Largeur de porte" />
                      <BoolField control={control} name="elevator.has_braille" label="Braille" />
                      <BoolField control={control} name="elevator.has_audio" label="Annonces sonores" />
                    </>
                  )}
                </fieldset>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "…" : "Enregistrer"}
      </Button>
    </form>
  );
}
