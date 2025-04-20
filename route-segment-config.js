// route-segment-config.js
export const dynamicRouteConfig = {
    // This tells Next.js to render this route dynamically at request time
    dynamic: 'force-dynamic',
    // Don't attempt to statically optimize this route
    revalidate: 0,
    // Don't include in the static export
    fetchCache: 'force-no-store'
  };