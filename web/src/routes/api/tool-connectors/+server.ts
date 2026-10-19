import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig, DEFAULT_TOOL_CONNECTOR_IDS } from '$lib/server/adminSettings';

export const GET: RequestHandler = async () => {
  try {
    const config = getAdminConfig();
    const enabledToolConnectors = config.enabledToolConnectors || DEFAULT_TOOL_CONNECTOR_IDS;
    return json({
      success: true,
      enabledToolConnectors
    }, {
      headers: {
        'Cache-Control': 'public, max-age=15, s-maxage=30'
      }
    });
  } catch (err: any) {
    return json({
      success: false,
      enabledToolConnectors: DEFAULT_TOOL_CONNECTOR_IDS,
      error: err.message
    }, { status: 500 });
  }
};
