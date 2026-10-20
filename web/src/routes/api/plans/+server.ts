import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig, DEFAULT_TOOL_CONNECTOR_IDS } from '$lib/server/adminSettings';
import { DEFAULT_PLANS } from '$lib/config/plans';

export const GET: RequestHandler = async () => {
  try {
    const config = getAdminConfig();
    const plans = config.plans || DEFAULT_PLANS;
    const enabledToolConnectors = config.enabledToolConnectors || DEFAULT_TOOL_CONNECTOR_IDS;
    return json({
      success: true,
      plans,
      enabledToolConnectors,
      workflowCustomizationUserEnabled: config.workflowCustomizationUserEnabled !== false
    }, {
      headers: {
        'Cache-Control': 'public, max-age=15, s-maxage=30'
      }
    });
  } catch (err: any) {
    return json({
      success: false,
      plans: DEFAULT_PLANS,
      enabledToolConnectors: DEFAULT_TOOL_CONNECTOR_IDS,
      workflowCustomizationUserEnabled: true,
      error: err.message
    }, { status: 500 });
  }
};
