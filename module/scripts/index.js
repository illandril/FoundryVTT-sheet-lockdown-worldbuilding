import Settings from './settings.js';
import { CSS_PREFIX } from './module.js';

const CSS_SHEET = `${CSS_PREFIX}sheet`;
const CSS_LOCK = `${CSS_PREFIX}lock`;
const CSS_EDIT = `${CSS_PREFIX}edit`;
const CSS_TOGGLE_EDIT_ON = `${CSS_PREFIX}toggleEditOn`;
const CSS_TOGGLE_EDIT_OFF = `${CSS_PREFIX}toggleEditOff`;
const CSS_HIDE = `${CSS_PREFIX}hide`;
const CSS_NO_POINTER_EVENTS = `${CSS_PREFIX}noPointerEvents`;

Hooks.on('renderActorSheet', (actorSheet) => {
  if (!actorSheet.isEditable) {
    return;
  }
  const sheetElem = actorSheet.element[0];
  if (!sheetElem) {
    return;
  }

  if (!sheetElem.classList.contains(CSS_SHEET)) {
    sheetElem.classList.add(CSS_SHEET);
    sheetElem.classList.add(CSS_LOCK);
    if (game.user.hasRole(Settings.ShowToggleEditRole.get())) {
      const sheetHeader = sheetElem.querySelector('.window-header');
      const sheetTitle = sheetHeader.querySelector('.window-title');

      const editOnLink = document.createElement('a');
      editOnLink.appendChild(faIcon('lock'));
      editOnLink.classList.add(CSS_TOGGLE_EDIT_ON);
      const toggleOnString = game.i18n.localize('illandril-sheet-lockdown-worldbuilding.toggleEditOn');
      editOnLink.appendChild(document.createTextNode(toggleOnString));
      editOnLink.addEventListener('click', () => makeLocked(sheetElem, false), false);
      editOnLink.addEventListener('dblclick', stopPropagation, false);
      sheetHeader.insertBefore(editOnLink, sheetTitle.nextSibling);

      const editOffLink = document.createElement('a');
      editOffLink.appendChild(faIcon('unlock'));
      editOffLink.classList.add(CSS_TOGGLE_EDIT_OFF);
      const toggleOffString = game.i18n.localize('illandril-sheet-lockdown-worldbuilding.toggleEditOff');
      editOffLink.appendChild(document.createTextNode(toggleOffString));
      editOffLink.addEventListener('click', () => makeLocked(sheetElem, true), false);
      editOffLink.addEventListener('dblclick', stopPropagation, false);
      sheetHeader.insertBefore(editOffLink, sheetTitle.nextSibling);
    }
    makeLocked(sheetElem, sheetElem.classList.contains(CSS_LOCK));
  }
});

const makeLocked = (sheetElem, locked) => {
  addRemoveClass(sheetElem, CSS_LOCK, locked);
  addRemoveClass(sheetElem, CSS_EDIT, !locked);
  for (let elem of sheetElem.querySelectorAll('[data-action],.group-controls,.editor-edit')) {
    addRemoveClass(elem, CSS_HIDE, locked);
  }
  for (let elem of sheetElem.querySelectorAll('input,select')) {
    elem.disabled = locked;
  }
  for (let elem of sheetElem.querySelectorAll('.profile-img')) {
    addRemoveClass(elem, CSS_NO_POINTER_EVENTS, locked);
  }
};

const addRemoveClass = (element, cssClass, isAdd) => {
  if (!element) {
    return;
  }
  isAdd ? element.classList.add(cssClass) : element.classList.remove(cssClass);
};

const faIcon = (name) => {
  const icon = document.createElement('i');
  icon.classList.add('fas');
  icon.classList.add('fa-' + name);
  return icon;
};

const stopPropagation = (event) => {
  event.stopPropagation();
};
