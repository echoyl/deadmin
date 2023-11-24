/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser | undefined }) {
  const { currentUser } = initialState || {};

  let permissions = [];
  currentUser?.permission?.split(',').forEach((p) => {
    const items = p.split('.');
    !permissions.includes(items[0]) && permissions.push(items[0]);
    !permissions.includes(items.join('/')) && permissions.push(items.join('/'));
    items.pop();
    !permissions.includes(items.join('/')) && permissions.push(items.join('/'));
  });

  //console.log(permissions);
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    routeFilter: (router) => {
      return true;
      if (currentUser) {
        if (router.path == '/posts/category') {
          console.log(router.path, permissions.includes(router.path.substr(1)));
        }
        if (currentUser.name == 'admin') {
          return true;
        }
        return permissions.includes(router.path?.substr(1));
      }
    },
  };
}
