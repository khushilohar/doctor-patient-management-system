import User from "./users_model";
import Role from "./roles_model";
import UserRole from "./user_roles_model";
import Resource from "./resources_model";
import Action from "./actions_model";
import ResourceAction from "./resource_actions_model";
import PermissionRole from "./permission_roles_model";

// User ↔ Role
User.belongsToMany(Role, { through: UserRole, foreignKey: "user_id" });
Role.belongsToMany(User, { through: UserRole, foreignKey: "role_id" });

// Role ↔ Permission
Role.belongsToMany(ResourceAction, {
  through: PermissionRole,
  foreignKey: "role_id",
});

// Resource ↔ Action
Resource.belongsToMany(Action, {
  through: ResourceAction,
  foreignKey: "resource_id",
});

Action.belongsToMany(Resource, {
  through: ResourceAction,
  foreignKey: "action_id",
});

ResourceAction.belongsTo(Resource, { foreignKey: 'resource_id' });
ResourceAction.belongsTo(Action, { foreignKey: 'action_id' });

PermissionRole.belongsTo(Role, { foreignKey: 'role_id' });
PermissionRole.belongsTo(ResourceAction, { foreignKey: 'resource_action_id' });

// Optionally, if you need direct access from UserRole to User/Role
UserRole.belongsTo(User, { foreignKey: 'user_id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id' });
// const permissionRole = await PermissionRole.findByPk(1, { include: [Role, ResourceAction] });