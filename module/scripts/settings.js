import { KEY as MODULE_KEY } from './module.js';

const settingsList = [];

class Setting {
  constructor(type, key, defaultValue, options = {}) {
    this.type = type;
    this.key = key;
    this.hasHint = !!options.hasHint;
    this.defaultValue = defaultValue;
    this.choices = options.choices || null;
    this.scope = options.scope || 'world';
    settingsList.push(this);
  }

  register() {
    const name = game.i18n.localize(`${MODULE_KEY}.setting.${this.key}.label`);
    const hint = this.hasHint ? game.i18n.localize(`${MODULE_KEY}.setting.${this.key}.hint`) : null;
    game.settings.register(MODULE_KEY, this.key, {
      name,
      hint,
      scope: this.scope,
      config: true,
      default: this.defaultValue,
      type: this.type,
      choices: this.choices,
    });
  }

  get() {
    return game.settings.get(MODULE_KEY, this.key);
  }
}

class ChoiceSetting extends Setting {
  constructor(key, defaultValue, choices, options = {}) {
    super(
      String,
      key,
      defaultValue,
      mergeObject(
        options,
        {
          choices,
        },
        {
          inplace: false,
        }
      )
    );
  }
}

const minimumRoleChoices = Object.keys(CONST.USER_ROLES).reduce((choices, roleKey) => {
  if (roleKey !== 'NONE') {
    choices[roleKey] = `USER.Role${roleKey.titleCase()}`;
  }
  return choices;
}, {});

const Settings = {
  // Core Settings
  ShowToggleEditRole: new ChoiceSetting('showToggleEditRole', 'GAMEMASTER', minimumRoleChoices, {
    hasHint: true,
  }),
};

Object.freeze(Settings);
export default Settings;

Hooks.once('init', () => {
  settingsList.forEach((setting) => {
    setting.register();
  });
});
