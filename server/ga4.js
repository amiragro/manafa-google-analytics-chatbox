const { BetaAnalyticsDataClient } = require("@google-analytics/data");
const { GoogleAuth } = require("google-auth-library");

let analyticsClient = null;

/**
 * Initialize GA4 client with service account credentials
 */
function getClient() {
  if (analyticsClient) return analyticsClient;

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS environment variable not set"
    );
  }

  const auth = new GoogleAuth({
    keyFilename: credentialsPath,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });

  analyticsClient = new BetaAnalyticsDataClient({ auth });
  return analyticsClient;
}

/**
 * Query GA4 data
 * @param {Object} params
 * @param {string[]} params.dimensions - GA4 dimensions (e.g., ['date', 'country'])
 * @param {string[]} params.metrics - GA4 metrics (e.g., ['totalUsers', 'sessions'])
 * @param {string} params.startDate - Start date (YYYY-MM-DD or relative like '7daysAgo')
 * @param {string} params.endDate - End date (YYYY-MM-DD or relative like 'yesterday')
 * @param {number} params.limit - Max rows to return (default 100)
 * @param {Object} params.dimensionFilter - Optional dimension filter
 * @param {Object[]} params.orderBys - Optional order by clauses
 * @returns {Object} { rows: [...], totals: {...}, metadata: {...} }
 */
async function queryGA4(params) {
  const client = getClient();
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("GA4_PROPERTY_ID environment variable not set");
  }

  const {
    dimensions = ["date"],
    metrics = ["totalUsers", "sessions"],
    startDate = "7daysAgo",
    endDate = "yesterday",
    limit = 100,
    dimensionFilter = null,
    orderBys = null,
  } = params;

  // Build request
  const request = {
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: dimensions.map((d) => ({ name: d })),
    metrics: metrics.map((m) => ({ name: m })),
    limit,
  };

  // Add dimension filter if provided
  if (dimensionFilter) {
    request.dimensionFilter = dimensionFilter;
  }

  // Add ordering
  if (orderBys && orderBys.length > 0) {
    request.orderBys = orderBys;
  } else {
    // Default: sort by first metric descending
    request.orderBys = [
      {
        metric: { metricName: metrics[0] },
        desc: true,
      },
    ];
  }

  try {
    const [response] = await client.runReport(request);

    // Parse rows
    const rows = (response.rows || []).map((row) => {
      const parsed = {};
      dimensions.forEach((dim, i) => {
        parsed[dim] = row.dimensionValues[i]?.value || "";
      });
      metrics.forEach((met, i) => {
        const val = row.metricValues[i]?.value || "0";
        // Try to parse as number
        parsed[met] = isNaN(val) ? val : parseFloat(val);
      });
      return parsed;
    });

    // Parse totals
    const totals = {};
    if (response.totals && response.totals.length > 0) {
      metrics.forEach((met, i) => {
        const val = response.totals[0].metricValues[i]?.value || "0";
        totals[met] = isNaN(val) ? val : parseFloat(val);
      });
    }

    return {
      rows,
      totals,
      metadata: {
        rowCount: response.rowCount || rows.length,
        dimensions,
        metrics,
        dateRange: { startDate, endDate },
        propertyId,
      },
    };
  } catch (err) {
    console.error("[GA4 Error]", err.message);

    if (err.message.includes("permission")) {
      throw new Error(
        "Permission denied. Check service account access in GA4."
      );
    }
    if (err.message.includes("not found")) {
      throw new Error(
        `Property ${propertyId} not found. Check your GA4_PROPERTY_ID.`
      );
    }
    throw err;
  }
}

module.exports = { queryGA4 };
