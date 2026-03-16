/**
 * Pre-built inventory templates for quick survey completion
 * Helps surveyors quickly add common items for different property types
 */

export const INVENTORY_TEMPLATES = {
  studio_apartment: {
    id: 'studio_apartment',
    name: 'Studio Apartment',
    nameAr: 'ستوديو',
    icon: '🏠',
    rooms: [
      {
        room_name: 'Living Area',
        room_type: 'living',
        items: [
          { custom_name: 'Sofa (2-3 seater)', quantity: 1, cbm: 1.2 },
          { custom_name: 'Coffee Table', quantity: 1, cbm: 0.15 },
          { custom_name: 'TV Unit', quantity: 1, cbm: 0.4 },
          { custom_name: 'TV 43-55 inch', quantity: 1, cbm: 0.1 },
          { custom_name: 'Side Table', quantity: 2, cbm: 0.08 },
        ]
      },
      {
        room_name: 'Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'Queen/Double Bed', quantity: 1, cbm: 1.5 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.5 },
          { custom_name: 'Bedside Table (x2)', quantity: 2, cbm: 0.1 },
          { custom_name: 'Wardrobe (2-door)', quantity: 1, cbm: 1.2 },
          { custom_name: 'Dressing Table', quantity: 1, cbm: 0.5 },
        ]
      },
      {
        room_name: 'Kitchen',
        room_type: 'kitchen',
        items: [
          { custom_name: 'Refrigerator', quantity: 1, cbm: 0.6 },
          { custom_name: 'Washing Machine', quantity: 1, cbm: 0.5 },
          { custom_name: 'Microwave', quantity: 1, cbm: 0.05 },
          { custom_name: 'Kitchen Cabinets', quantity: 1, cbm: 1.0 },
          { custom_name: 'Dining Table (2-4 seats)', quantity: 1, cbm: 0.5 },
        ]
      }
    ],
    estimatedCBM: 6.88
  },

  one_bhk: {
    id: 'one_bhk',
    name: '1 BHK Apartment',
    nameAr: 'غرفة وصالة',
    icon: '🏢',
    rooms: [
      {
        room_name: 'Living Room',
        room_type: 'living',
        items: [
          { custom_name: 'Sofa Set (3+1+1)', quantity: 1, cbm: 1.8 },
          { custom_name: 'Center Table', quantity: 1, cbm: 0.2 },
          { custom_name: 'TV Unit', quantity: 1, cbm: 0.5 },
          { custom_name: 'TV 55 inch', quantity: 1, cbm: 0.15 },
          { custom_name: 'Side Tables', quantity: 2, cbm: 0.1 },
          { custom_name: 'Showcase/Cabinet', quantity: 1, cbm: 0.8 },
        ]
      },
      {
        room_name: 'Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'King/Queen Bed', quantity: 1, cbm: 1.8 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.6 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.1 },
          { custom_name: 'Wardrobe (3-door)', quantity: 1, cbm: 1.5 },
          { custom_name: 'Dressing Table with Stool', quantity: 1, cbm: 0.6 },
          { custom_name: 'Chest of Drawers', quantity: 1, cbm: 0.4 },
        ]
      },
      {
        room_name: 'Kitchen',
        room_type: 'kitchen',
        items: [
          { custom_name: 'Refrigerator (Large)', quantity: 1, cbm: 0.8 },
          { custom_name: 'Washing Machine', quantity: 1, cbm: 0.5 },
          { custom_name: 'Dishwasher', quantity: 1, cbm: 0.4 },
          { custom_name: 'Microwave', quantity: 1, cbm: 0.05 },
          { custom_name: 'Oven', quantity: 1, cbm: 0.3 },
          { custom_name: 'Kitchen Cabinets', quantity: 1, cbm: 1.2 },
          { custom_name: 'Dining Table (4 seats)', quantity: 1, cbm: 0.6 },
        ]
      }
    ],
    estimatedCBM: 10.4
  },

  two_bhk: {
    id: 'two_bhk',
    name: '2 BHK Apartment',
    nameAr: 'غرفتين وصالة',
    icon: '🏢',
    rooms: [
      {
        room_name: 'Living Room',
        room_type: 'living',
        items: [
          { custom_name: 'L-Shaped Sofa Set', quantity: 1, cbm: 2.2 },
          { custom_name: 'Center Table', quantity: 1, cbm: 0.25 },
          { custom_name: 'TV Unit', quantity: 1, cbm: 0.6 },
          { custom_name: 'TV 65 inch', quantity: 1, cbm: 0.2 },
          { custom_name: 'Side Tables', quantity: 2, cbm: 0.12 },
          { custom_name: 'Showcase Unit', quantity: 1, cbm: 1.0 },
        ]
      },
      {
        room_name: 'Master Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'King Size Bed', quantity: 1, cbm: 2.0 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.7 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.12 },
          { custom_name: 'Wardrobe (4-door)', quantity: 1, cbm: 1.8 },
          { custom_name: 'Dressing Table', quantity: 1, cbm: 0.7 },
          { custom_name: 'Chest of Drawers', quantity: 1, cbm: 0.5 },
          { custom_name: 'Full Length Mirror', quantity: 1, cbm: 0.1 },
        ]
      },
      {
        room_name: 'Second Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'Queen/Single Bed', quantity: 1, cbm: 1.5 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.5 },
          { custom_name: 'Bedside Table', quantity: 1, cbm: 0.08 },
          { custom_name: 'Wardrobe (2-door)', quantity: 1, cbm: 1.2 },
          { custom_name: 'Study Table', quantity: 1, cbm: 0.4 },
          { custom_name: 'Bookshelf', quantity: 1, cbm: 0.3 },
        ]
      },
      {
        room_name: 'Kitchen & Dining',
        room_type: 'kitchen',
        items: [
          { custom_name: 'Double Door Fridge', quantity: 1, cbm: 1.0 },
          { custom_name: 'Washing Machine', quantity: 1, cbm: 0.5 },
          { custom_name: 'Dishwasher', quantity: 1, cbm: 0.4 },
          { custom_name: 'Microwave', quantity: 1, cbm: 0.05 },
          { custom_name: 'Oven', quantity: 1, cbm: 0.3 },
          { custom_name: 'Kitchen Cabinets', quantity: 1, cbm: 1.5 },
          { custom_name: 'Dining Table (6 seats)', quantity: 1, cbm: 0.8 },
        ]
      }
    ],
    estimatedCBM: 15.8
  },

  three_bhk: {
    id: 'three_bhk',
    name: '3 BHK Apartment',
    nameAr: 'ثلاث غرف وصالة',
    icon: '🏢',
    rooms: [
      {
        room_name: 'Living Room',
        room_type: 'living',
        items: [
          { custom_name: 'L-Shaped Sofa Set', quantity: 1, cbm: 2.5 },
          { custom_name: '2-Seater Sofa', quantity: 1, cbm: 1.0 },
          { custom_name: 'Center Table', quantity: 1, cbm: 0.3 },
          { custom_name: 'TV Unit', quantity: 1, cbm: 0.7 },
          { custom_name: 'TV 75 inch', quantity: 1, cbm: 0.25 },
          { custom_name: 'Side Tables', quantity: 3, cbm: 0.15 },
          { custom_name: 'Showcase Unit', quantity: 1, cbm: 1.2 },
          { custom_name: 'Coffee Table', quantity: 1, cbm: 0.15 },
        ]
      },
      {
        room_name: 'Master Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'King Size Bed with Storage', quantity: 1, cbm: 2.5 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.8 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.15 },
          { custom_name: 'Wardrobe (5-door)', quantity: 1, cbm: 2.2 },
          { custom_name: 'Dressing Table', quantity: 1, cbm: 0.8 },
          { custom_name: 'Chest of Drawers', quantity: 1, cbm: 0.6 },
          { custom_name: 'Full Length Mirror', quantity: 1, cbm: 0.12 },
          { custom_name: 'Armchair', quantity: 1, cbm: 0.3 },
        ]
      },
      {
        room_name: 'Second Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'Queen Bed', quantity: 1, cbm: 1.8 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.6 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.1 },
          { custom_name: 'Wardrobe (3-door)', quantity: 1, cbm: 1.5 },
          { custom_name: 'Study Table', quantity: 1, cbm: 0.5 },
          { custom_name: 'Bookshelf', quantity: 1, cbm: 0.4 },
        ]
      },
      {
        room_name: 'Third Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'Single/Queen Bed', quantity: 1, cbm: 1.2 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.4 },
          { custom_name: 'Bedside Table', quantity: 1, cbm: 0.08 },
          { custom_name: 'Wardrobe (2-door)', quantity: 1, cbm: 1.0 },
          { custom_name: 'Study Table', quantity: 1, cbm: 0.4 },
        ]
      },
      {
        room_name: 'Kitchen & Dining',
        room_type: 'kitchen',
        items: [
          { custom_name: 'Double Door Fridge', quantity: 1, cbm: 1.2 },
          { custom_name: 'Washing Machine', quantity: 1, cbm: 0.6 },
          { custom_name: 'Dishwasher', quantity: 1, cbm: 0.5 },
          { custom_name: 'Microwave', quantity: 1, cbm: 0.05 },
          { custom_name: 'Oven', quantity: 1, cbm: 0.4 },
          { custom_name: 'Kitchen Cabinets', quantity: 1, cbm: 2.0 },
          { custom_name: 'Dining Table (6-8 seats)', quantity: 1, cbm: 1.0 },
        ]
      }
    ],
    estimatedCBM: 22.5
  },

  villa: {
    id: 'villa',
    name: 'Villa',
    nameAr: 'فيلا',
    icon: '🏡',
    rooms: [
      {
        room_name: 'Majlis (Living Room)',
        room_type: 'living',
        items: [
          { custom_name: 'L-Shaped Sofa Set (Large)', quantity: 1, cbm: 3.0 },
          { custom_name: '2-3 Seater Sofa', quantity: 2, cbm: 2.5 },
          { custom_name: 'Center Tables (x2)', quantity: 2, cbm: 0.5 },
          { custom_name: 'TV Unit (Large)', quantity: 1, cbm: 1.0 },
          { custom_name: 'TV 85 inch', quantity: 1, cbm: 0.3 },
          { custom_name: 'Side Tables', quantity: 4, cbm: 0.2 },
          { custom_name: 'Display Cabinets (x2)', quantity: 2, cbm: 2.0 },
          { custom_name: 'Coffee Tables', quantity: 2, cbm: 0.3 },
        ]
      },
      {
        room_name: 'Master Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'King Size Bed with Storage', quantity: 1, cbm: 2.8 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.9 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.2 },
          { custom_name: 'Walk-in Wardrobe', quantity: 1, cbm: 3.0 },
          { custom_name: 'Dressing Table', quantity: 1, cbm: 1.0 },
          { custom_name: 'Chest of Drawers', quantity: 1, cbm: 0.7 },
          { custom_name: 'Full Length Mirror', quantity: 1, cbm: 0.15 },
          { custom_name: 'Armchair', quantity: 2, cbm: 0.6 },
          { custom_name: 'Ottoman', quantity: 1, cbm: 0.3 },
        ]
      },
      {
        room_name: 'Second Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'Queen Bed', quantity: 1, cbm: 2.0 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.7 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.15 },
          { custom_name: 'Wardrobe (4-door)', quantity: 1, cbm: 1.8 },
          { custom_name: 'Study Table', quantity: 1, cbm: 0.6 },
          { custom_name: 'Bookshelf', quantity: 1, cbm: 0.5 },
        ]
      },
      {
        room_name: 'Third Bedroom',
        room_type: 'bedroom',
        items: [
          { custom_name: 'Queen Bed', quantity: 1, cbm: 1.8 },
          { custom_name: 'Mattress', quantity: 1, cbm: 0.6 },
          { custom_name: 'Bedside Tables (x2)', quantity: 2, cbm: 0.12 },
          { custom_name: 'Wardrobe (3-door)', quantity: 1, cbm: 1.5 },
          { custom_name: 'Study Table', quantity: 1, cbm: 0.5 },
        ]
      },
      {
        room_name: 'Dining Room',
        room_type: 'dining',
        items: [
          { custom_name: 'Dining Table (8-10 seats)', quantity: 1, cbm: 1.5 },
          { custom_name: 'China Cabinet', quantity: 1, cbm: 1.2 },
          { custom_name: 'Sideboard', quantity: 1, cbm: 0.8 },
        ]
      },
      {
        room_name: 'Kitchen',
        room_type: 'kitchen',
        items: [
          { custom_name: 'Double Door Fridge', quantity: 1, cbm: 1.5 },
          { custom_name: 'Washing Machine', quantity: 1, cbm: 0.6 },
          { custom_name: 'Dishwasher', quantity: 1, cbm: 0.5 },
          { custom_name: 'Microwave', quantity: 1, cbm: 0.05 },
          { custom_name: 'Oven', quantity: 1, cbm: 0.5 },
          { custom_name: 'Kitchen Cabinets', quantity: 1, cbm: 2.5 },
        ]
      }
    ],
    estimatedCBM: 35.0
  },

  office: {
    id: 'office',
    name: 'Office',
    nameAr: 'مكتب',
    icon: '🏢',
    rooms: [
      {
        room_name: 'Work Area',
        room_type: 'office',
        items: [
          { custom_name: 'Executive Desk (Large)', quantity: 1, cbm: 1.5 },
          { custom_name: 'Office Chair (x5)', quantity: 5, cbm: 1.0 },
          { custom_name: 'Conference Table', quantity: 1, cbm: 1.2 },
          { custom_name: 'Filing Cabinets (x4)', quantity: 4, cbm: 0.8 },
          { custom_name: 'Bookshelves (x3)', quantity: 3, cbm: 1.2 },
        ]
      },
      {
        room_name: 'Reception',
        room_type: 'office',
        items: [
          { custom_name: 'Reception Desk', quantity: 1, cbm: 1.0 },
          { custom_name: 'Sofa Set (3+1+1)', quantity: 1, cbm: 1.5 },
          { custom_name: 'Coffee Table', quantity: 1, cbm: 0.2 },
        ]
      }
    ],
    estimatedCBM: 7.4
  },

  warehouse: {
    id: 'warehouse',
    name: 'Warehouse/Godown',
    nameAr: 'مستودع',
    icon: '📦',
    rooms: [
      {
        room_name: 'Storage Area',
        room_type: 'warehouse',
        items: [
          { custom_name: 'Pallet Rack (x10)', quantity: 10, cbm: 5.0 },
          { custom_name: 'Industrial Shelves (x5)', quantity: 5, cbm: 2.5 },
          { custom_name: 'Storage Boxes (x50)', quantity: 50, cbm: 3.0 },
        ]
      }
    ],
    estimatedCBM: 10.5
  }
}

/**
 * Get template by ID
 */
export function getTemplate(id) {
  return INVENTORY_TEMPLATES[id] || null
}

/**
 * Get all templates
 */
export function getAllTemplates() {
  return Object.values(INVENTORY_TEMPLATES)
}

/**
 * Get templates for bedroom count
 */
export function getTemplatesByBedrooms(bedrooms) {
  const map = {
    'Studio': 'studio_apartment',
    '1': 'one_bhk',
    '2': 'two_bhk',
    '3': 'three_bhk',
    '4': 'three_bhk',
    '5': 'three_bhk',
    '6+': 'villa'
  }
  const templateId = map[bedrooms] || 'one_bhk'
  return getTemplate(templateId)
}
