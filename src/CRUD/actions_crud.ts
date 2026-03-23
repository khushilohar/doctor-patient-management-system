import Action from '../models/actions_model';
import { ActionCreateInput, ActionUpdateInput } from '../schemas/actions_schema';

// Create a new action.
export async function createAction(data: ActionCreateInput) {
  return await Action.create(data as any);
}

// Retrieve an action by primary key.
export async function getActionById(id: number) {
  return await Action.findByPk(id);
}

// Retrieve an action by its unique code.
export async function getActionByCode(code: string) {
  return await Action.findOne({ where: { code } });
}

// Get paginated list of actions.
export async function getActions(
  where: any = {},
  limit: number = 10,
  offset: number = 0
) {
  return await Action.findAndCountAll({ where, limit, offset });
}

// Update an existing action.
export async function updateAction(id: number, data: ActionUpdateInput) {
  const action = await Action.findByPk(id);
  if (!action) throw new Error('Action not found');
  await action.update(data);
  return action;
}

// Delete an action (hard delete).
export async function deleteAction(id: number) {
  return await Action.destroy({ where: { id } });
}

// Get all resources that are associated with this action via
export async function getResourcesByAction(actionId: number) {
  const ResourceAction = (await import('../models/resource_actions_model')).default;
  const Resource = (await import('../models/resources_model')).default;

  const resourceActions = await ResourceAction.findAll({
    where: { action_id: actionId },
    include: [{ model: Resource, attributes: ['id', 'name', 'code'] }],
  });

  return resourceActions.map(ra => ra.resource_id);
}

// Export types for service layer
export type ActionCrud = {
  createAction: typeof createAction;
  getActionById: typeof getActionById;
  getActionByCode: typeof getActionByCode;
  getActions: typeof getActions;
  updateAction: typeof updateAction;
  deleteAction: typeof deleteAction;
  getResourcesByAction: typeof getResourcesByAction;
};