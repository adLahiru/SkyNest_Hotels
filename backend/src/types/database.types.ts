// Database connection types
export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit?: number;
}

// Generic database result interfaces
export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
  insertId?: number;
}

// Query result types
export interface QueryResult {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
}

// Common database operations
export interface DatabaseOperations {
  create<T>(table: string, data: Partial<T>): Promise<DatabaseResult<T>>;
  findById<T>(table: string, id: string): Promise<DatabaseResult<T>>;
  findOne<T>(table: string, conditions: Partial<T>): Promise<DatabaseResult<T>>;
  findMany<T>(table: string, conditions?: Partial<T>): Promise<DatabaseResult<T[]>>;
  update<T>(table: string, id: string, data: Partial<T>): Promise<DatabaseResult<T>>;
  delete(table: string, id: string): Promise<DatabaseResult>;
}

export default DatabaseConfig;