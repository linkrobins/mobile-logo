import app from 'flarum/admin/app';

const EXT_ID = 'linkrobins-mobile-logo';
const PREFIX = EXT_ID + '.';

const trans = (key) => app.translator.trans(PREFIX + 'admin.settings.' + key);

app.initializers.add('linkrobins/mobile-logo', () => {
  const registry = app.registry.for(EXT_ID);

  registry.registerSetting({
    setting: PREFIX + 'source',
    type: 'select',
    options: {
      favicon: trans('source_favicon'),
      logo: trans('source_logo'),
      custom: trans('source_custom'),
    },
    default: 'favicon',
    label: trans('source_label'),
    help: trans('source_help'),
  });

  registry.registerSetting({
    setting: PREFIX + 'custom_url',
    type: 'text',
    label: trans('custom_url_label'),
    help: trans('custom_url_help'),
  });

  registry.registerSetting({
    setting: PREFIX + 'height',
    type: 'number',
    min: 16,
    max: 64,
    label: trans('height_label'),
    help: trans('height_help'),
  });

  registry.registerSetting({
    setting: PREFIX + 'link_home',
    type: 'boolean',
    label: trans('link_home_label'),
    help: trans('link_home_help'),
  });
});
