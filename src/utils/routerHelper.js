
let routerInstance = null;

export const setRouterInstance = (router) => {
  routerInstance = router;
};

export const navigateTo = (path) => {
  if (routerInstance) {
    routerInstance.push(path);
  } else {
    window.location.href = path;
  }
};