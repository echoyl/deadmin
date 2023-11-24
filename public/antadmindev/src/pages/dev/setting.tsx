import PostsForm from '@/components/Sadmin/posts/post';

export default () => {
  return (
    <PostsForm
      url="dev/setting"
      formTitle={false}
      formColumns={[
        { title: '系统名称', dataIndex: 'title' },
        { title: '技术支持', dataIndex: 'tech' },
        {
          valueType: 'group',
          columns: [
            { title: '子标题', dataIndex: 'subtitle', width: 'md' },
            { title: '后台前缀', dataIndex: 'baseurl', width: 'md' },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              title: '水印设置',
              dataIndex: 'watermark',
              tooltip: '1.username表示后台用户名',
              width: 'md',
            },
            { title: '腾讯地图key', dataIndex: 'tmap_key', width: 'md' },
          ],
        },
        {
          valueType: 'group',
          columns: [
            {
              title: '开发模式',
              valueType: 'switch',
              dataIndex: 'dev',
              fieldProps: {
                defaultChecked: true,
              },
            },
            {
              title: '多语言',
              valueType: 'switch',
              dataIndex: 'lang',
              fieldProps: {
                defaultChecked: true,
              },
            },
            {
              title: '分割菜单 - 顶部显示大菜单',
              valueType: 'switch',
              dataIndex: 'splitMenus',
            },
          ],
        },
        {
          valueType: 'group',
          columns: [
            { title: 'logo', valueType: 'uploader', dataIndex: 'logo' },
            {
              title: 'favicons',
              tooltip: '自行覆盖目录下的favicon.ico 文件',
              readonly: true,
              dataIndex: 'favicons',
            },
          ],
        },
        {
          valueType: 'group',
          title: '登录设置',
          columns: [
            { title: '登录页背景图', valueType: 'uploader', dataIndex: 'loginBgImgage' },
            {
              title: '登录方式',
              valueType: 'checkbox',
              dataIndex: 'loginType',
              fieldProps: {
                options: [
                  { label: '账号密码', value: 'password' },
                  { label: '手机号登录', value: 'phone' },
                ],
              },
            },
            {
              title: '默认登录方式',
              valueType: 'radio',
              dataIndex: 'loginTypeDefault',
              fieldProps: {
                options: [
                  { label: '账号密码', value: 'password' },
                  { label: '手机号登录', value: 'phone' },
                ],
              },
            },
          ],
        },
        {
          valueType: 'group',
          title: '短信设置',
          columns: [
            {
              title: '短信平台',
              valueType: 'select',
              dataIndex: 'sms_type',
              fieldProps: {
                options: [{ label: '阿里云', value: 'aliyun' }],
              },
            },
            {
              title: '验证码模板id',
              dataIndex: 'sms_code_id',
            },
            {
              title: '模板名称',
              dataIndex: 'sms_name',
            },
          ],
        },
        { title: '主题配置', dataIndex: 'theme', valueType: 'jsonEditor' },
      ]}
      msgcls={() => {
        return;
      }}
    />
  );
};
