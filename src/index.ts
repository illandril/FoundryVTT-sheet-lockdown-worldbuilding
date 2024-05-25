import module from './module';
import './styles.scss';

const CSS_SHEET = module.cssPrefix.child('sheet');
const CSS_LOCK = module.cssPrefix.child('lock');
const CSS_EDIT = module.cssPrefix.child('edit');
const CSS_TOGGLE_EDIT_ON = module.cssPrefix.child('toggleEditOn');
const CSS_TOGGLE_EDIT_OFF = module.cssPrefix.child('toggleEditOff');
const CSS_HIDE = module.cssPrefix.child('hide');
const CSS_NO_POINTER_EVENTS = module.cssPrefix.child('noPointerEvents');

const minimumRoleChoices = Object.keys(foundry.CONST.USER_ROLES).reduce(
  (choices, roleKey) => {
    if (roleKey !== 'NONE') {
      choices[roleKey] = `USER.Role${roleKey.titleCase()}`;
    }
    return choices;
  },
  {} as { [name: string]: string },
);

const ShowToggleEditRole = module.settings.register('showToggleEditRole', String, 'GAMEMASTER', {
  hasHint: true,
  choices: minimumRoleChoices,
});

Hooks.on('renderActorSheet', (actorSheet) => {
  module.logger.debug('rendorActorSheet', actorSheet.isEditable);
  if (!actorSheet.isEditable) {
    return;
  }
  const sheetElem = actorSheet.element[0];
  if (!sheetElem) {
    module.logger.debug('actorSheet had no element');
    return;
  }

  if (sheetElem.classList.contains(CSS_SHEET)) {
    module.logger.debug('actorSheet was already enhanced');
    return;
  }
  sheetElem.classList.add(CSS_SHEET);
  sheetElem.classList.add(CSS_LOCK);
  if (game.user?.hasRole(ShowToggleEditRole.get())) {
    const sheetHeader = sheetElem.querySelector('.window-header');
    if (!sheetHeader) {
      module.logger.error('Could not lock sheet - no window-header was found');
      return;
    }
    const sheetTitle = sheetHeader.querySelector('.window-title');
    if (!sheetTitle) {
      module.logger.error('Could not lock sheet - no window-title was found');
      return;
    }

    const editOnLink = document.createElement('a');
    editOnLink.appendChild(faIcon('lock'));
    editOnLink.classList.add(CSS_TOGGLE_EDIT_ON);
    editOnLink.appendChild(document.createTextNode(module.localize('toggleEditOn')));
    editOnLink.addEventListener('click', () => makeLocked(actorSheet, sheetElem, false), false);
    editOnLink.addEventListener('dblclick', stopPropagation, false);
    sheetHeader.insertBefore(editOnLink, sheetTitle.nextSibling);

    const editOffLink = document.createElement('a');
    editOffLink.appendChild(faIcon('unlock'));
    editOffLink.classList.add(CSS_TOGGLE_EDIT_OFF);
    editOffLink.appendChild(document.createTextNode(module.localize('toggleEditOff')));
    editOffLink.addEventListener('click', () => makeLocked(actorSheet, sheetElem, true), false);
    editOffLink.addEventListener('dblclick', stopPropagation, false);
    sheetHeader.insertBefore(editOffLink, sheetTitle.nextSibling);
  }
  makeLocked(actorSheet, sheetElem, sheetElem.classList.contains(CSS_LOCK));
});

const makeLocked = (actorSheet: ActorSheet, sheetElem: HTMLElement, locked: boolean) => {
  module.logger.debug('makeLocked', sheetElem, locked);

  actorSheet.options.editable = !locked;

  addRemoveClass(sheetElem, CSS_LOCK, locked);
  addRemoveClass(sheetElem, CSS_EDIT, !locked);
  for (const elem of sheetElem.querySelectorAll('[data-action],.group-controls,.editor-edit')) {
    addRemoveClass(elem, CSS_HIDE, locked);
  }
  for (const elem of sheetElem.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input,select')) {
    elem.disabled = locked;
  }
  for (const elem of sheetElem.querySelectorAll('.profile-img')) {
    addRemoveClass(elem, CSS_NO_POINTER_EVENTS, locked);
  }
};

const addRemoveClass = (element: Element, cssClass: string, isAdd: boolean) => {
  module.logger.debug('addRemoveClass', element, cssClass, isAdd);
  if (isAdd) {
    element.classList.add(cssClass);
  } else {
    element.classList.remove(cssClass);
  }
};

const faIcon = (name: string) => {
  const icon = document.createElement('i');
  icon.classList.add('fas');
  icon.classList.add(`fa-${name}`);
  return icon;
};

const stopPropagation = (event: Event) => {
  event.stopPropagation();
};
