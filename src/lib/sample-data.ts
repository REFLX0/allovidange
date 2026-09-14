export interface SampleAppointment {
  id: string;
  reference: string;
  status: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  internalNotes: string | null;
  cancelReason: string | null;
  rescheduleCount: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  vehicleId: string | null;
  serviceId: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  vehicle: {
    id: string;
    brand: string;
    model: string;
    engine: string | null;
    year: number | null;
    plate: string | null;
    mileage: number | null;
    notes: string | null;
    customerId: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  service: {
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number | null;
    color: string;
    isActive: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  };
}

const now = new Date();
const d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0);
const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30);
const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0);
const d3 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 8, 0);

export const SAMPLE_APPOINTMENTS: SampleAppointment[] = [
  {
    id: "demo-1",
    reference: "RDV-VID-89A1",
    status: "CONFIRMED",
    date: now,
    startTime: d0,
    endTime: new Date(d0.getTime() + 35 * 60000),
    internalNotes: "Client régulier. Prévoir huile 5W40 certifiée constructeur.",
    cancelReason: null,
    rescheduleCount: 0,
    createdAt: new Date(now.getTime() - 86400000),
    updatedAt: now,
    customerId: "cust-1",
    vehicleId: "veh-1",
    serviceId: "service-2",
    customer: {
      id: "cust-1",
      name: "Mohamed Trabelsi",
      phone: "+216 22 345 678",
      email: "m.trabelsi@gmail.com",
      notes: null,
      createdAt: now,
      updatedAt: now,
    },
    vehicle: {
      id: "veh-1",
      brand: "Peugeot",
      model: "308",
      engine: "1.6 HDi",
      year: 2018,
      plate: "198 TU 4521",
      mileage: 95000,
      notes: null,
      customerId: "cust-1",
      createdAt: now,
      updatedAt: now,
    },
    service: {
      id: "service-2",
      name: "Vidange + Filtre à huile",
      description: "Vidange moteur complète et filtre à huile neuf",
      duration: 35,
      price: 65,
      color: "#C0101A",
      isActive: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    id: "demo-2",
    reference: "RDV-REV-23B4",
    status: "PENDING",
    date: now,
    startTime: d1,
    endTime: new Date(d1.getTime() + 60 * 60000),
    internalNotes: "Demande vérification de la climatisation en plus.",
    cancelReason: null,
    rescheduleCount: 0,
    createdAt: now,
    updatedAt: now,
    customerId: "cust-2",
    vehicleId: "veh-2",
    serviceId: "service-8",
    customer: {
      id: "cust-2",
      name: "Youssef Gharbi",
      phone: "+216 98 765 432",
      email: "youssef.gh@topnet.tn",
      notes: null,
      createdAt: now,
      updatedAt: now,
    },
    vehicle: {
      id: "veh-2",
      brand: "Volkswagen",
      model: "Golf 7",
      engine: "1.4 TSI",
      year: 2017,
      plate: "189 TU 8823",
      mileage: 112000,
      notes: null,
      customerId: "cust-2",
      createdAt: now,
      updatedAt: now,
    },
    service: {
      id: "service-8",
      name: "Pack Révision Complète",
      description: "Vidange + tous filtres + contrôle 20 points",
      duration: 60,
      price: 130,
      color: "#8B5CF6",
      isActive: true,
      sortOrder: 8,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    id: "demo-3",
    reference: "RDV-DIA-47C9",
    status: "IN_PROGRESS",
    date: now,
    startTime: d2,
    endTime: new Date(d2.getTime() + 30 * 60000),
    internalNotes: "Voyant moteur allumé sur le tableau de bord.",
    cancelReason: null,
    rescheduleCount: 0,
    createdAt: now,
    updatedAt: now,
    customerId: "cust-3",
    vehicleId: "veh-3",
    serviceId: "service-6",
    customer: {
      id: "cust-3",
      name: "Sonia Mansouri",
      phone: "+216 55 112 233",
      email: "sonia.mansouri@yahoo.fr",
      notes: null,
      createdAt: now,
      updatedAt: now,
    },
    vehicle: {
      id: "veh-3",
      brand: "Renault",
      model: "Clio 4",
      engine: "0.9 TCe",
      year: 2019,
      plate: "205 TU 1390",
      mileage: 68000,
      notes: null,
      customerId: "cust-3",
      createdAt: now,
      updatedAt: now,
    },
    service: {
      id: "service-6",
      name: "Diagnostic électronique",
      description: "Lecture des calculateurs",
      duration: 30,
      price: 50,
      color: "#6B7280",
      isActive: true,
      sortOrder: 6,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    id: "demo-4",
    reference: "RDV-VID-91D2",
    status: "COMPLETED",
    date: now,
    startTime: d3,
    endTime: new Date(d3.getTime() + 30 * 60000),
    internalNotes: "Intervention effectuée. Prochaine vidange à 67 000 km.",
    cancelReason: null,
    rescheduleCount: 0,
    createdAt: now,
    updatedAt: now,
    customerId: "cust-4",
    vehicleId: "veh-4",
    serviceId: "service-1",
    customer: {
      id: "cust-4",
      name: "Karim Ben Salah",
      phone: "+216 20 998 877",
      email: null,
      notes: null,
      createdAt: now,
      updatedAt: now,
    },
    vehicle: {
      id: "veh-4",
      brand: "Hyundai",
      model: "i20",
      engine: "1.2 Essence",
      year: 2020,
      plate: "215 TU 6745",
      mileage: 52000,
      notes: null,
      customerId: "cust-4",
      createdAt: now,
      updatedAt: now,
    },
    service: {
      id: "service-1",
      name: "Vidange moteur",
      description: "Huile 5W30",
      duration: 30,
      price: 45,
      color: "#C0101A",
      isActive: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
  },
];

export const SAMPLE_CLIENTS = [
  {
    id: "cust-1",
    name: "Mohamed Trabelsi",
    phone: "+216 22 345 678",
    email: "m.trabelsi@gmail.com",
    notes: "Client régulier. Prévoir huile 5W40 certifiée.",
    createdAt: new Date(now.getTime() - 90 * 86400000),
    updatedAt: now,
    _count: { appointments: 3, vehicles: 1 },
    appointments: [
      {
        id: "demo-1",
        date: now,
        service: { name: "Vidange + Filtre à huile" },
      },
    ],
    vehicles: [
      {
        id: "veh-1",
        brand: "Peugeot",
        model: "308",
        plate: "198 TU 4521",
        engine: "1.6 HDi",
        year: 2018,
        mileage: 95000,
      },
    ],
  },
  {
    id: "cust-2",
    name: "Youssef Gharbi",
    phone: "+216 98 765 432",
    email: "youssef.gh@topnet.tn",
    notes: "Intéressé par entretien préventif et révision.",
    createdAt: new Date(now.getTime() - 45 * 86400000),
    updatedAt: now,
    _count: { appointments: 2, vehicles: 1 },
    appointments: [
      {
        id: "demo-2",
        date: now,
        service: { name: "Pack Révision Complète" },
      },
    ],
    vehicles: [
      {
        id: "veh-2",
        brand: "Volkswagen",
        model: "Golf 7",
        plate: "189 TU 8823",
        engine: "1.4 TSI",
        year: 2017,
        mileage: 112000,
      },
    ],
  },
  {
    id: "cust-3",
    name: "Sonia Mansouri",
    phone: "+216 55 112 233",
    email: "sonia.mansouri@yahoo.fr",
    notes: null,
    createdAt: new Date(now.getTime() - 20 * 86400000),
    updatedAt: now,
    _count: { appointments: 1, vehicles: 1 },
    appointments: [
      {
        id: "demo-3",
        date: now,
        service: { name: "Diagnostic électronique" },
      },
    ],
    vehicles: [
      {
        id: "veh-3",
        brand: "Renault",
        model: "Clio 4",
        plate: "205 TU 1390",
        engine: "0.9 TCe",
        year: 2019,
        mileage: 68000,
      },
    ],
  },
  {
    id: "cust-4",
    name: "Karim Ben Salah",
    phone: "+216 20 998 877",
    email: null,
    notes: "Flotte d'entreprise - contrôle régulier.",
    createdAt: new Date(now.getTime() - 10 * 86400000),
    updatedAt: now,
    _count: { appointments: 4, vehicles: 2 },
    appointments: [
      {
        id: "demo-4",
        date: now,
        service: { name: "Vidange moteur" },
      },
    ],
    vehicles: [
      {
        id: "veh-4",
        brand: "Hyundai",
        model: "i20",
        plate: "215 TU 6745",
        engine: "1.2 Essence",
        year: 2020,
        mileage: 52000,
      },
    ],
  },
];

export const SAMPLE_VEHICLES = [
  {
    id: "veh-1",
    brand: "Peugeot",
    model: "308",
    plate: "198 TU 4521",
    engine: "1.6 HDi",
    year: 2018,
    mileage: 95000,
    notes: "Huile préconisée 5W40",
    customerId: "cust-1",
    customer: {
      id: "cust-1",
      name: "Mohamed Trabelsi",
      phone: "+216 22 345 678",
    },
    createdAt: new Date(now.getTime() - 90 * 86400000),
  },
  {
    id: "veh-2",
    brand: "Volkswagen",
    model: "Golf 7",
    plate: "189 TU 8823",
    engine: "1.4 TSI",
    year: 2017,
    mileage: 112000,
    notes: null,
    customerId: "cust-2",
    customer: {
      id: "cust-2",
      name: "Youssef Gharbi",
      phone: "+216 98 765 432",
    },
    createdAt: new Date(now.getTime() - 45 * 86400000),
  },
  {
    id: "veh-3",
    brand: "Renault",
    model: "Clio 4",
    plate: "205 TU 1390",
    engine: "0.9 TCe",
    year: 2019,
    mileage: 68000,
    notes: "Voyant moteur surveillé",
    customerId: "cust-3",
    customer: {
      id: "cust-3",
      name: "Sonia Mansouri",
      phone: "+216 55 112 233",
    },
    createdAt: new Date(now.getTime() - 20 * 86400000),
  },
  {
    id: "veh-4",
    brand: "Hyundai",
    model: "i20",
    plate: "215 TU 6745",
    engine: "1.2 Essence",
    year: 2020,
    mileage: 52000,
    notes: null,
    customerId: "cust-4",
    customer: {
      id: "cust-4",
      name: "Karim Ben Salah",
      phone: "+216 20 998 877",
    },
    createdAt: new Date(now.getTime() - 10 * 86400000),
  },
];
