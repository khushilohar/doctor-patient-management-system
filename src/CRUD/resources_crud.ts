import Resource from '../models/resources_model';
import { ResourceCreateInput, ResourceUpdateInput } from '../schemas/resources_schema';

// Create a new resource.
export async function createResource(data: ResourceCreateInput) {
  return await Resource.create(data as any);
}

// Retrieve a resource by primary key.
export async function getResourceById(id: number) {
  return await Resource.findByPk(id);
}

// Retrieve a resource by its unique code.
export async function getResourceByCode(code: string) {
  return await Resource.findOne({ where: { code } });
}

// Get paginated list of resources.
export async function getResources(
  where: any = {},
  limit: number = 10,
  offset: number = 0
) {
  return await Resource.findAndCountAll({ where, limit, offset });
}

// Update an existing resource.
export async function updateResource(id: number, data: ResourceUpdateInput) {
  const resource = await Resource.findByPk(id);
  if (!resource) throw new Error('Resource not found');
  await resource.update(data);
  return resource;
}

// Delete a resource (hard delete).
export async function deleteResource(id: number) {
  return await Resource.destroy({ where: { id } });
}

// Get all actions that are associated with this resource via resource_actions.
export async function getActionsByResource(resourceId: number) {
  const ResourceAction = (await import('../models/resource_actions_model')).default;
  const Action = (await import('../models/actions_model')).default;

  const resourceActions = await ResourceAction.findAll({
    where: { resource_id: resourceId },
    include: [{ model: Action, attributes: ['id', 'name', 'code'] }],
  });

  return resourceActions.map(ra => ra.action_id);
}

// Export types for service layer
export type ResourceCrud = {
  createResource: typeof createResource;
  getResourceById: typeof getResourceById;
  getResourceByCode: typeof getResourceByCode;
  getResources: typeof getResources;
  updateResource: typeof updateResource;
  deleteResource: typeof deleteResource;
  getActionsByResource: typeof getActionsByResource;
};