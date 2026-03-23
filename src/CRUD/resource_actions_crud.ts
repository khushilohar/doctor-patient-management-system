import ResourceAction from '../models/resource_actions_model';
import Resource from '../models/resources_model';
import Action from '../models/actions_model';
import { ResourceActionCreateInput } from '../schemas/resource_actions_schema';
import { Op } from 'sequelize';

// Create a single resource-action link.
export async function createResourceAction(data: ResourceActionCreateInput) {
  return await ResourceAction.create(data as any);
}

// Retrieve a resource-action link by its primary key.
export async function getResourceActionById(id: number) {
  return await ResourceAction.findByPk(id, {
    include: [Resource, Action]
  });
}

// Retrieve a resource-action link by resource and action IDs.
export async function getResourceActionByResourceAndAction(resourceId: number, actionId: number) {
  return await ResourceAction.findOne({
    where: { resource_id: resourceId, action_id: actionId },
    include: [Resource, Action]
  });
}

// Get paginated list of resource-action links.
export async function getResourceActions(
  where: any = {},
  limit: number = 10,
  offset: number = 0,
  includeAssociations: boolean = true
) {
  const options: any = { where, limit, offset };
  if (includeAssociations) {
    options.include = [Resource, Action];
  }
  return await ResourceAction.findAndCountAll(options);
}

// Update a resource-action link (rarely used; usually you delete and recreate).
export async function updateResourceAction(id: number, data: Partial<ResourceActionCreateInput>) {
  const ra = await ResourceAction.findByPk(id);
  if (!ra) throw new Error('ResourceAction link not found');
  await ra.update(data);
  return ra;
}

// Delete a resource-action link by ID.
export async function deleteResourceAction(id: number) {
  return await ResourceAction.destroy({ where: { id } });
}

// Remove a specific action from a resource.
export async function removeActionFromResource(resourceId: number, actionId: number) {
  return await ResourceAction.destroy({
    where: { resource_id: resourceId, action_id: actionId }
  });
}

// Remove all actions from a resource.
export async function removeAllActionsFromResource(resourceId: number) {
  return await ResourceAction.destroy({ where: { resource_id: resourceId } });
}

// Bulk assign multiple actions to a resource.
export async function assignActionsToResource(resourceId: number, actionIds: number[]) {
  // Optionally remove duplicates and existing assignments before bulk create
  const existing = await ResourceAction.findAll({
    where: { resource_id: resourceId, action_id: { [Op.in]: actionIds } },
    attributes: ['action_id']
  });
  const existingActionIds = existing.map(ea => ea.action_id);
  const newActionIds = actionIds.filter(aid => !existingActionIds.includes(aid));

  if (newActionIds.length === 0) return [];

  const records = newActionIds.map(actionId => ({
    resource_id: resourceId,
    action_id: actionId
  }));
  return await ResourceAction.bulkCreate(records);
}

// Get all action IDs that belong to a resource.
export async function getActionsByResource(resourceId: number) {
  const resourceActions = await ResourceAction.findAll({
    where: { resource_id: resourceId },
    attributes: ['action_id']
  });
  return resourceActions.map(ra => ra.action_id);
}

// Get all resource IDs that have a specific action.
export async function getResourcesByAction(actionId: number) {
  const resourceActions = await ResourceAction.findAll({
    where: { action_id: actionId },
    attributes: ['resource_id']
  });
  return resourceActions.map(ra => ra.resource_id);
}

// Get all actions with details for a given resource.
export async function getActionDetailsByResource(resourceId: number) {
  const resourceActions = await ResourceAction.findAll({
    where: { resource_id: resourceId },
    include: [{ model: Action, attributes: ['id', 'name', 'code', 'description'] }]
  });
  return resourceActions.map(ra => (ra as any).Action);
}

// Get all resources with details that have a specific action.
export async function getResourceDetailsByAction(actionId: number) {
  const resourceActions = await ResourceAction.findAll({
    where: { action_id: actionId },
    include: [{ model: Resource, attributes: ['id', 'name', 'code', 'description'] }]
  });
  return resourceActions.map(ra => (ra as any).Resource);
}

// Export types for service layer
export type ResourceActionCrud = {
  createResourceAction: typeof createResourceAction;
  getResourceActionById: typeof getResourceActionById;
  getResourceActionByResourceAndAction: typeof getResourceActionByResourceAndAction;
  getResourceActions: typeof getResourceActions;
  updateResourceAction: typeof updateResourceAction;
  deleteResourceAction: typeof deleteResourceAction;
  removeActionFromResource: typeof removeActionFromResource;
  removeAllActionsFromResource: typeof removeAllActionsFromResource;
  assignActionsToResource: typeof assignActionsToResource;
  getActionsByResource: typeof getActionsByResource;
  getResourcesByAction: typeof getResourcesByAction;
  getActionDetailsByResource: typeof getActionDetailsByResource;
  getResourceDetailsByAction: typeof getResourceDetailsByAction;
};