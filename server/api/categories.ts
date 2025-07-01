import {H3Event} from "h3";
import { getDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event : H3Event) => {
  const { user } = await requireUserSession(event)
 
  const domain = user.domain;
	const db = getDatabase(domain);
  return db.prepare(` WITH RECURSIVE category_tree AS (
  SELECT 
    id,
    parent_id,
    name,
    type,
    node_type,
    name AS full_path
  FROM financial_categories
  WHERE parent_id IS NULL

  UNION ALL

  SELECT 
    fc.id,
    fc.parent_id,
    fc.name,
    fc.type,
    fc.node_type,
    ct.full_path || ' › ' || fc.name
  FROM financial_categories fc
  JOIN category_tree ct ON fc.parent_id = ct.id
)
SELECT 
  id AS key, 
  full_path AS value
FROM category_tree

  
ORDER BY full_path;`).all()
})
