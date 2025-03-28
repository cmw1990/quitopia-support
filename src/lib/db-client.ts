// Mock database client for the micro-frontend
// In production, this would connect to the actual database through REST APIs

export const dbClient = {
  query: async (table: string, query: any = {}) => {
    console.log(`Querying ${table} with:`, query);
    return { data: [], error: null };
  },
  
  insert: async (table: string, data: any) => {
    console.log(`Inserting into ${table}:`, data);
    return { data: { id: 'mock-id', ...data }, error: null };
  },
  
  update: async (table: string, query: any = {}, data: any) => {
    console.log(`Updating ${table} with:`, data, 'where:', query);
    return { data: { id: 'mock-id', ...data }, error: null };
  },
  
  delete: async (table: string, query: any = {}) => {
    console.log(`Deleting from ${table} where:`, query);
    return { data: null, error: null };
  }
}; 