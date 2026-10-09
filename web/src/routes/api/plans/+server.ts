import { json, type RequestHandler } from '@sveltejs/kit';
import { getAdminConfig } from '$lib/server/adminSettings';
import { DEFAULT_PLANS } from '$lib/config/plans';

export const GET: RequestHandler = async () => {
  try {
    const config = getAdminConfig();
    const plans = config.plans || DEFAULT_PLANS;
    return json({
      success: true,
      plans
    }, {
      headers: {
        'Cache-Control': 'public, max-age=15, s-maxage=30'
      }
    });
  } catch (err: any) {
    return json({
      success: false,
      plans: DEFAULT_PLANS,
      error: err.message
    }, { status: 500 });
  }
};
