import { authService } from '../services/authService';
import type { CustomButton } from '../interfaces/customButtons';

/**
 * Simple function to create a button only if user has permission
 * @param buttonId - The button ID
 * @param requiredPermission - The permission required to show the button
 * @param buttonConfig - The button configuration
 * @returns The button if user has permission, undefined otherwise
 */
export function createButtonIfPermitted(
  buttonId: string,
  requiredPermission: string,
  buttonConfig: Omit<CustomButton, 'id'>
): CustomButton | undefined {
  if (authService.hasPermission(requiredPermission) || authService.hasRole(1)) {
    return {
      id: buttonId,
      ...buttonConfig
    };
  }
  return undefined;
}

/**
 * Simple function to create multiple buttons based on permissions
 * @param buttonDefinitions - Array of button definitions with permissions
 * @returns Array of buttons that user has permission to see
 */
export function createButtonsWithPermissions(
  buttonDefinitions: Array<{
    id: string;
    permission: string;
    config: Omit<CustomButton, 'id'>;
  }>
): CustomButton[] {
  return buttonDefinitions
    .map(def => createButtonIfPermitted(def.id, def.permission, def.config))
    .filter((button): button is CustomButton => button !== undefined);
} 