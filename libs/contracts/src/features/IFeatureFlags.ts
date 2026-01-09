/**
 * Feature flags interface
 * Defines all available feature toggles in the system
 */
export interface IFeatureFlags {
  /**
   * Enables workspace management functionality
   * When disabled, workspace endpoints return 404 and UI is hidden
   */
  workspaceEnabled: boolean;

  /**
   * Enables workspace switching functionality
   * When disabled, users can only view their default workspace
   */
  workspaceSwitchingEnabled: boolean;
}
