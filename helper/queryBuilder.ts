import { Criteria } from "@/types/MasterDataTypes.js";
import { db } from "@/config/connection.js";
import { Client, PoolClient } from "pg";

export const insertQuery = (table: string, values: any, returning: string | null = null): [string, string[]] => {
  let valuesArray = [];

  // Check if values is an array or a single object
  if (Array.isArray(values)) {
    valuesArray = values;
  } else if (typeof values === "object" && values !== null) {
    valuesArray = [values]; // Wrap the single object in an array
  } else {
    throw new Error("Values should be an object or an array of objects.");
  }

  let columnArray: string[] = [];
  let payloadArray: string[] = [];
  let valueArray: string[] = [];

  // Assuming the first object in the array has all the columns we need
  Object.keys(valuesArray[0]).forEach((key) => {
    columnArray.push(key);
  });

  // Build the payload and value arrays for multiple rows
  valuesArray.forEach((valueObj, rowIndex) => {
    let rowPlaceholders: string[] = [];
    Object.keys(valueObj).forEach((key, colIndex) => {
      rowPlaceholders.push(`$${rowIndex * columnArray.length + colIndex + 1}`);
      valueArray.push(valueObj[key]);
    });
    payloadArray.push(`(${rowPlaceholders.join(", ")})`);
  });

  const columns = columnArray.join(", ");
  const valuesString = payloadArray.join(", ");
  let query = `INSERT INTO ${table} (${columns}) VALUES ${valuesString}`;
  if (returning != null) {
    query += ` RETURNING ${returning}`;
  } else {
    query += ";";
  }

  return [query, valueArray];
};

export const deleteQuery = (table: string, where: any): [string, string[]] => {
  let query = "";
  let valueArray: string[] = [];
  const whereArray = Object.keys(where).map((item, index) => {
    valueArray.push(where[item]);
    return `${item} = $${index + 1}`;
  });
  query = "DELETE FROM " + table + " WHERE " + whereArray.join(" AND ") + ";";
  return [query, valueArray];
};

export const updateQuery = (
  table: string,
  value: any,
  where: any,
  returning: string | null = null
): [string, string[]] => {
  let valueArray: string[] = [];
  let setArray: string[] = [];
  let whereArray: string[] = [];
  Object.keys(value).forEach((key, ix) => {
    setArray.push(key + ` = $${ix + 1}`);
  });
  Object.values(value).forEach((v: any) => {
    valueArray.push(v);
  });
  Object.keys(where).forEach((key) => {
    whereArray.push(key + ` = '${where[key]}'`);
  });
  let whereString = whereArray.join(" AND ");
  const setString = setArray.join(", ");
  let query = `UPDATE ${table} SET ${setString} WHERE ${whereString}`;
  if (returning !== null) {
    query += ` RETURNING ${returning}`;
  } else {
    query += " ;";
  }
  return [query, valueArray];
};

export const updateCriteriaQuery = (editedCriteria: Criteria[]) => {
  // Define the table and columns to be updated
  const tableName = "mst_criteria";
  const columns = ["criteria_name", "minimum_score", "maximum_score", "updated_by", "updated_date"];

  // Start building the SQL query
  let query = `UPDATE ${tableName} AS cr SET `;

  // Map columns to the updated values from the temporary table (aliased as "u")
  query += columns.map((column) => `${column} = u.${column}`).join(", ");

  query += ` FROM (VALUES `;

  // Iterate over each item and build the VALUES part of the query
  const valuesClause = editedCriteria
    .map((item) => {
      return `(
              '${item.criteria_name}',
              '${item.minimum_score}', 
              ${item.maximum_score}, 
              ${item.updated_by}, 
              '${item.updated_date}' 
          )`;
    })
    .join(", ");

  // Append VALUES and create an alias for each column
  query += valuesClause;
  query += `) AS u(id, ${columns.join(", ")})`;

  // Finalize the query with the join condition
  query += ` WHERE cr.id = u.id;`;

  return query;
};

export const ClientAction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
  try {
    const client = await db.connect();
    try {
      return await callback(client);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    throw error;
  }
};
