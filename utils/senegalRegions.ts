
export interface Department {
  name: string;
  region: string;
}

export interface Region {
  name: string;
  departments: string[];
  price: number;
}

export const SENEGAL_REGIONS: Region[] = [
  {
    name: 'Dakar',
    departments: ['Dakar', 'Guédiawaye', 'Pikine', 'Rufisque'],
    price: 2000,
  },
  {
    name: 'Thiès',
    departments: ['Thiès', 'Mbour', 'Tivaouane'],
    price: 3500,
  },
  {
    name: 'Diourbel',
    departments: ['Diourbel', 'Bambey', 'Mbacké'],
    price: 4000,
  },
  {
    name: 'Fatick',
    departments: ['Fatick', 'Foundiougne', 'Gossas'],
    price: 4500,
  },
  {
    name: 'Kaolack',
    departments: ['Kaolack', 'Guinguinéo', 'Nioro du Rip'],
    price: 5000,
  },
  {
    name: 'Louga',
    departments: ['Louga', 'Kébémer', 'Linguère'],
    price: 5500,
  },
  {
    name: 'Matam',
    departments: ['Matam', 'Kanel', 'Ranérou'],
    price: 7000,
  },
  {
    name: 'Saint-Louis',
    departments: ['Saint-Louis', 'Dagana', 'Podor'],
    price: 6000,
  },
  {
    name: 'Tambacounda',
    departments: ['Tambacounda', 'Bakel', 'Goudiry', 'Koumpentoum'],
    price: 8000,
  },
  {
    name: 'Kaffrine',
    departments: ['Kaffrine', 'Birkelane', 'Koungheul', 'Malem-Hodar'],
    price: 5500,
  },
  {
    name: 'Kédougou',
    departments: ['Kédougou', 'Salémata', 'Saraya'],
    price: 9000,
  },
  {
    name: 'Kolda',
    departments: ['Kolda', 'Médina Yoro Foulah', 'Vélingara'],
    price: 7500,
  },
  {
    name: 'Sédhiou',
    departments: ['Sédhiou', 'Bounkiling', 'Goudomp'],
    price: 7000,
  },
  {
    name: 'Ziguinchor',
    departments: ['Ziguinchor', 'Bignona', 'Oussouye'],
    price: 8000,
  },
];

// Add Touba as a special destination
export const SPECIAL_DESTINATIONS = [
  {
    name: 'Touba',
    region: 'Diourbel',
    price: 4500,
  },
];

export function getAllDestinations(): { name: string; type: 'region' | 'department' | 'special'; region?: string; price: number }[] {
  const destinations: { name: string; type: 'region' | 'department' | 'special'; region?: string; price: number }[] = [];

  // Add regions
  SENEGAL_REGIONS.forEach(region => {
    destinations.push({
      name: region.name,
      type: 'region',
      price: region.price,
    });

    // Add departments
    region.departments.forEach(dept => {
      destinations.push({
        name: dept,
        type: 'department',
        region: region.name,
        price: region.price,
      });
    });
  });

  // Add special destinations
  SPECIAL_DESTINATIONS.forEach(special => {
    destinations.push({
      name: special.name,
      type: 'special',
      region: special.region,
      price: special.price,
    });
  });

  return destinations;
}

export function getDestinationPrice(destinationName: string): number {
  // Check special destinations first
  const special = SPECIAL_DESTINATIONS.find(s => s.name.toLowerCase() === destinationName.toLowerCase());
  if (special) {
    return special.price;
  }

  // Check regions
  const region = SENEGAL_REGIONS.find(r => r.name.toLowerCase() === destinationName.toLowerCase());
  if (region) {
    return region.price;
  }

  // Check departments
  for (const region of SENEGAL_REGIONS) {
    const dept = region.departments.find(d => d.toLowerCase() === destinationName.toLowerCase());
    if (dept) {
      return region.price;
    }
  }

  // Default price if not found
  return 5000;
}

export function searchDestinations(query: string): { name: string; type: 'region' | 'department' | 'special'; region?: string; price: number }[] {
  if (!query || query.length < 1) {
    return [];
  }

  const allDestinations = getAllDestinations();
  const lowerQuery = query.toLowerCase();

  return allDestinations.filter(dest =>
    dest.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}
