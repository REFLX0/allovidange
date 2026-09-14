export interface ServiceItem {
  id: string;
  name: string;
  duration: number;
  price: number | null;
  description: string | null;
  color: string;
}

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "service-1",
    name: "Vidange moteur",
    description: "Vidange complète avec huile moteur 5W30/5W40 certifiée constructeur.",
    duration: 30,
    price: 45,
    color: "#C0101A",
  },
  {
    id: "service-2",
    name: "Vidange + Filtre à huile",
    description: "Vidange moteur complète et remplacement du filtre à huile neuf.",
    duration: 35,
    price: 65,
    color: "#C0101A",
  },
  {
    id: "service-3",
    name: "Remplacement filtre à air",
    description: "Contrôle et remplacement du filtre à air moteur.",
    duration: 20,
    price: 25,
    color: "#3B82F6",
  },
  {
    id: "service-4",
    name: "Filtre habitacle (Pollen / Climatisation)",
    description: "Purification de l'air de l'habitacle et élimination des allergènes.",
    duration: 15,
    price: 30,
    color: "#3B82F6",
  },
  {
    id: "service-5",
    name: "Remplacement filtre à carburant",
    description: "Protection des injecteurs et de la pompe haute pression.",
    duration: 30,
    price: 40,
    color: "#F59E0B",
  },
  {
    id: "service-6",
    name: "Diagnostic électronique multimarque",
    description: "Lecture complète des calculateurs et effacement des voyants avec valise pro.",
    duration: 30,
    price: 50,
    color: "#6B7280",
  },
  {
    id: "service-7",
    name: "Contrôle des niveaux & liquides",
    description: "Mise à niveau liquide de frein, liquide de refroidissement et lave-glace.",
    duration: 15,
    price: 20,
    color: "#22C55E",
  },
  {
    id: "service-8",
    name: "Pack Révision Complète",
    description: "Vidange + tous filtres + contrôle 20 points + pression pneumatiques.",
    duration: 60,
    price: 130,
    color: "#8B5CF6",
  },
];
