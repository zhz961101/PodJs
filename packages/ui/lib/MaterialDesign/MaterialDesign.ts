// AUTO-GENERATED Sat, 02 Jan 2021 12:56:55 GMT
import { MetaComponent, createVNode } from '@tacopie/taco';
import { mustRequire } from '../common';

type Corner =
    | 'TOP_LEFT'
    | 'TOP_RIGHT'
    | 'BOTTOM_LEFT'
    | 'BOTTOM_RIGHT'
    | 'TOP_START'
    | 'TOP_END'
    | 'BOTTOM_START'
    | 'BOTTOM_END';
type MenuCorner = 'START' | 'END';
type DefaultFocusState = 'NONE' | 'LIST_ROOT' | 'FIRST_ITEM' | 'LAST_ITEM';
type MWCListIndex = number | Set<number>;
// type SelectedType  = ListItemBase|ListItemBase[]|null;
type ListItemBase = any;
type ValidityTransform = any;
type TextFieldType =
    | 'text'
    | 'search'
    | 'tel'
    | 'url'
    | 'email'
    | 'password'
    | 'date'
    | 'month'
    | 'week'
    | 'time'
    | 'datetime-local'
    | 'number'
    | 'color';
type TextAreaCharCounter = 'external' | 'internal';

/**
 * @typedef ButtonProps
 * @property {string} label 			 - Label to display for the button, and aria-label.
 * @property {boolean} raised 			 - Creates a contained button that is elevated above the surface.
 * @property {boolean} unelevated 			 - Creates a contained button that is flush with the surface.
 * @property {boolean} outlined 			 - Creates an outlined button that is flush with the surface.
 * @property {boolean} dense 			 - Makes the button text and container slightly smaller.
 * @property {boolean} disabled 			 - Disabled buttons cannot be interacted with and have no visual interaction effect.
 * @property {boolean} trailingIcon 			 - When true, icon will be displayed _after_ label.
 * @property {boolean} expandContent 			 - When true, the space after the label and before any trailing icon, where default slotted content is rendered, is expanded to fit the available space inside the button.
 */
interface ButtonProps {
    label?: string; // Label to display for the button, and aria-label.
    raised?: boolean; // Creates a contained button that is elevated above the surface.
    unelevated?: boolean; // Creates a contained button that is flush with the surface.
    outlined?: boolean; // Creates an outlined button that is flush with the surface.
    dense?: boolean; // Makes the button text and container slightly smaller.
    disabled?: boolean; // Disabled buttons cannot be interacted with and have no visual interaction effect.
    trailingIcon?: boolean; // When true, icon will be displayed _after_ label.
    expandContent?: boolean; // When true, the space after the label and before any trailing icon, where default slotted content is rendered, is expanded to fit the available space inside the button.
}

/**
 * Material-Component Button
 * @type {Taco.MetaComponent<ButtonProps>}
 */
export const Button: MetaComponent<ButtonProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-button', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-button',
        { ...props, is: 'mwc-button' },
        props.children,
    );
};

/**
 * @typedef CheckboxProps
 * @property {boolean} indeterminate 			 - When a checkbox is the parent of a set of child checkboxes, the *indeterminate* state is used on the parent to indicate that some but not all of its children are checked.
 * @property {boolean} disabled 			 - When true, the checkbox cannot be interacted with, and renders in muted colors.
 * @property {string} value 			 - The value that will be included if the checkbox is submitted in a form.
 * @property {boolean} reducedTouchTarget 			 - When true, the checkbox remove padding for touchscreens and increase density. Note, the checkbox will no longer meet accessibility guidelines for touch.
 */
interface CheckboxProps {
    indeterminate?: boolean; // When a checkbox is the parent of a set of child checkboxes, the *indeterminate* state is used on the parent to indicate that some but not all of its children are checked.
    disabled?: boolean; // When true, the checkbox cannot be interacted with, and renders in muted colors.
    value?: string; // The value that will be included if the checkbox is submitted in a form.
    reducedTouchTarget?: boolean; // When true, the checkbox remove padding for touchscreens and increase density. Note, the checkbox will no longer meet accessibility guidelines for touch.
}

/**
 * Material-Component Checkbox
 * @type {Taco.MetaComponent<CheckboxProps>}
 */
export const Checkbox: MetaComponent<CheckboxProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-checkbox', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-checkbox',
        { ...props, is: 'mwc-checkbox' },
        props.children,
    );
};

/**
 * @typedef CircularProgressProps
 * @property {number} progress 			 - Sets the progress bars value. Value should be between [0, 1].
 * @property {number} density 			 - Sets the progress indicators sizing based on density scale. Minimum value is -8. Each unit change in density scale corresponds to 4px change in side dimensions. The stroke width adjusts automatically.
 * @property {boolean} closed 			 - Sets the progress indicator to the closed state. Sets content opacity to 0. Typically should be set to true when loading has finished.
 */
interface CircularProgressProps {
    progress?: number; // Sets the progress bars value. Value should be between [0, 1].
    density?: number; // Sets the progress indicators sizing based on density scale. Minimum value is -8. Each unit change in density scale corresponds to 4px change in side dimensions. The stroke width adjusts automatically.
    closed?: boolean; // Sets the progress indicator to the closed state. Sets content opacity to 0. Typically should be set to true when loading has finished.
}

/**
 * Material-Component CircularProgress
 * @type {Taco.MetaComponent<CircularProgressProps>}
 */
export const CircularProgress: MetaComponent<CircularProgressProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-circular-progress',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-circular-progress',
        { ...props, is: 'mwc-circular-progress' },
        props.children,
    );
};

/**
 * @typedef CircularProgressFourColorProps
 * @property {number} progress 			 - Sets the progress bars value. Value should be between [0, 1].
 * @property {number} density 			 - Sets the progress indicators sizing based on density scale. Minimum value is -8. Each unit change in density scale corresponds to 4px change in side dimensions. The stroke width adjusts automatically.
 * @property {boolean} closed 			 - Sets the progress indicator to the closed state. Sets content opacity to 0. Typically should be set to true when loading has finished.
 */
interface CircularProgressFourColorProps {
    progress?: number; // Sets the progress bars value. Value should be between [0, 1].
    density?: number; // Sets the progress indicators sizing based on density scale. Minimum value is -8. Each unit change in density scale corresponds to 4px change in side dimensions. The stroke width adjusts automatically.
    closed?: boolean; // Sets the progress indicator to the closed state. Sets content opacity to 0. Typically should be set to true when loading has finished.
}

/**
 * Material-Component CircularProgressFourColor
 * @type {Taco.MetaComponent<CircularProgressFourColorProps>}
 */
export const CircularProgressFourColor: MetaComponent<CircularProgressFourColorProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-circular-progress-four-color',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-circular-progress-four-color',
        { ...props, is: 'mwc-circular-progress-four-color' },
        props.children,
    );
};

/**
 * @typedef DialogProps
 * @property {boolean} hideActions 			 - Hides the actions footer of the dialog. Needed to remove excess padding when no actions are slotted in.
 * @property {boolean} stacked 			 - Whether to stack the action buttons.
 * @property {string} heading 			 - Heading text of the dialog.
 * @property {string} scrimClickAction 			 - _Default: close_ – Action to be emitted with the closing and closed events when the dialog closes because the scrim was clicked (see [actions
 */
interface DialogProps {
    hideActions?: boolean; // Hides the actions footer of the dialog. Needed to remove excess padding when no actions are slotted in.
    stacked?: boolean; // Whether to stack the action buttons.
    heading?: string; // Heading text of the dialog.
    scrimClickAction?: string; // _Default: close_ – Action to be emitted with the closing and closed events when the dialog closes because the scrim was clicked (see [actions
}

/**
 * Material-Component Dialog
 * @type {Taco.MetaComponent<DialogProps>}
 */
export const Dialog: MetaComponent<DialogProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-dialog', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-dialog',
        { ...props, is: 'mwc-dialog' },
        props.children,
    );
};

/**
 * @typedef DrawerProps
 * @property {boolean} hasHeader 			 - When true, displays the title, subtitle, and header slots.
 * @property {string} type 			 - When set to dismissible, overlays the drawer on the content. When set to modal, also adds a scrim when the drawer is open. When set to empty string, it is inlined with the page and displaces app content.
 */
interface DrawerProps {
    hasHeader?: boolean; // When true, displays the title, subtitle, and header slots.
    type?: string; // When set to dismissible, overlays the drawer on the content. When set to modal, also adds a scrim when the drawer is open. When set to empty string, it is inlined with the page and displaces app content.
}

/**
 * Material-Component Drawer
 * @type {Taco.MetaComponent<DrawerProps>}
 */
export const Drawer: MetaComponent<DrawerProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-drawer', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-drawer',
        { ...props, is: 'mwc-drawer' },
        props.children,
    );
};

/**
 * @typedef FabProps
 * @property {string} label 			 - The label to display when using the extended layout, and the aria-label attribute in all layouts.
 * @property {boolean} mini 			 - Modifies the FAB to be a smaller size, for use on smaller screens. Defaults to false.
 * @property {boolean} reducedTouchTarget 			 - Sets the minimum touch target of the default-sized mini fab to recommended 48x48px.
 * @property {boolean} extended 			 - Enable the *extended* layout which includes a text label. Defaults to false.
 * @property {boolean} showIconAtEnd 			 - When in the *extended* layout, position the icon after the label, instead of before. Defaults to false.
 */
interface FabProps {
    label?: string; // The label to display when using the extended layout, and the aria-label attribute in all layouts.
    mini?: boolean; // Modifies the FAB to be a smaller size, for use on smaller screens. Defaults to false.
    reducedTouchTarget?: boolean; // Sets the minimum touch target of the default-sized mini fab to recommended 48x48px.
    extended?: boolean; // Enable the *extended* layout which includes a text label. Defaults to false.
    showIconAtEnd?: boolean; // When in the *extended* layout, position the icon after the label, instead of before. Defaults to false.
}

/**
 * Material-Component Fab
 * @type {Taco.MetaComponent<FabProps>}
 */
export const Fab: MetaComponent<FabProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-fab', true, {
        type: 'module',
    });
    return createVNode('mwc-fab', { ...props, is: 'mwc-fab' }, props.children);
};

/**
 * @typedef FormfieldProps
 * @property {boolean} alignEnd 			 - Align the component at the end of the label.
 * @property {boolean} spaceBetween 			 - Add space between the component and the label as the formfield grows.
 * @property {boolean} nowrap 			 - Prevents the label from wrapping and overflow text is ellipsed.
 */
interface FormfieldProps {
    alignEnd?: boolean; // Align the component at the end of the label.
    spaceBetween?: boolean; // Add space between the component and the label as the formfield grows.
    nowrap?: boolean; // Prevents the label from wrapping and overflow text is ellipsed.
}

/**
 * Material-Component Formfield
 * @type {Taco.MetaComponent<FormfieldProps>}
 */
export const Formfield: MetaComponent<FormfieldProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-formfield', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-formfield',
        { ...props, is: 'mwc-formfield' },
        props.children,
    );
};

/**
 * @typedef IconButtonToggleProps
 * @property {string} onIcon 			 - Icon to display when on is true.
 * @property {string} offIcon 			 - Icon to display when on is false.
 * @property {string} label 			 - Accessible label for the button, sets aria-label.
 * @property {boolean} disabled 			 - Disabled buttons cannot be interacted with and have no visual interaction effect.
 */
interface IconButtonToggleProps {
    onIcon?: string; // Icon to display when on is true.
    offIcon?: string; // Icon to display when on is false.
    label?: string; // Accessible label for the button, sets aria-label.
    disabled?: boolean; // Disabled buttons cannot be interacted with and have no visual interaction effect.
}

/**
 * Material-Component IconButtonToggle
 * @type {Taco.MetaComponent<IconButtonToggleProps>}
 */
export const IconButtonToggle: MetaComponent<IconButtonToggleProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-icon-button-toggle',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-icon-button-toggle',
        { ...props, is: 'mwc-icon-button-toggle' },
        props.children,
    );
};

/**
 * @typedef IconButtonProps
 * @property {string} label 			 - Accessible label for the button, sets aria-label.
 * @property {boolean} disabled 			 - Disabled buttons cannot be interacted with and have no visual interaction effect.
 */
interface IconButtonProps {
    label?: string; // Accessible label for the button, sets aria-label.
    disabled?: boolean; // Disabled buttons cannot be interacted with and have no visual interaction effect.
}

/**
 * Material-Component IconButton
 * @type {Taco.MetaComponent<IconButtonProps>}
 */
export const IconButton: MetaComponent<IconButtonProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-icon-button',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-icon-button',
        { ...props, is: 'mwc-icon-button' },
        props.children,
    );
};

/**
 * @typedef IconProps
 
 */
interface IconProps {}

/**
 * Material-Component Icon
 * @type {Taco.MetaComponent<IconProps>}
 */
export const Icon: MetaComponent<IconProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-icon', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-icon',
        { ...props, is: 'mwc-icon' },
        props.children,
    );
};

/**
 * @typedef LinearProgressProps
 * @property {number} progress 			 - Sets the primary progress bars value. Value should be between [0, 1].
 * @property {number} buffer 			 - Sets the buffer progress bars value. Value should be between [0, 1]. Setting this value to be less than 1 will reveal moving, buffering dots.
 * @property {boolean} reverse 			 - Reverses the direction of the linear progress indicator.
 * @property {boolean} closed 			 - Sets the progress indicator to the closed state. Sets content opactiy to 0. Typically should be set to true when loading has finished.
 */
interface LinearProgressProps {
    progress?: number; // Sets the primary progress bars value. Value should be between [0, 1].
    buffer?: number; // Sets the buffer progress bars value. Value should be between [0, 1]. Setting this value to be less than 1 will reveal moving, buffering dots.
    reverse?: boolean; // Reverses the direction of the linear progress indicator.
    closed?: boolean; // Sets the progress indicator to the closed state. Sets content opactiy to 0. Typically should be set to true when loading has finished.
}

/**
 * Material-Component LinearProgress
 * @type {Taco.MetaComponent<LinearProgressProps>}
 */
export const LinearProgress: MetaComponent<LinearProgressProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-linear-progress',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-linear-progress',
        { ...props, is: 'mwc-linear-progress' },
        props.children,
    );
};

/**
 * @typedef MenuProps
 * @property {HTMLElement\} anchor 			 - null
 * @property {Corner*} corner 			 - Corner of the anchor from which the menu should position itself.
 * @property {MenuCorner} menuCorner 			 - Horizontal corner of the menu from which the menu should position itself. **NOTE:** Only horizontal corners are supported.
 * @property {boolean} quick 			 - Whether to skip the opening animation.
 * @property {boolean} absolute 			 - Makes the menus position absolute which will be relative to whichever ancestor has position:relative. Setting x and y will modify the menus left and top. Setting anchor will attempt to position the menu to the anchor.
 * @property {boolean} fixed 			 - Makes the menus position fixed which will be relative to the window. Setting x and y will modify the menus left and top. Setting anchor will attempt to position the menu to the anchors immediate position before opening.
 * @property {number\} x 			 - null
 * @property {number\} y 			 - null
 * @property {boolean} forceGroupSelection 			 - Forces a menu group to have a selected item by preventing deselection of menu items in menu groups via user interaction.
 * @property {DefaultFocusState} defaultFocus 			 - Item to focus upon menu open.
 * @property {boolean} fullwidth 			 - Sets surface width to 100%.
 * @property {boolean} wrapFocus 			 - Proxies to
 */
interface MenuProps {
    anchor?: HTMLElement; // null
    corner?: Corner; // Corner of the anchor from which the menu should position itself.
    menuCorner?: MenuCorner; // Horizontal corner of the menu from which the menu should position itself. **NOTE:** Only horizontal corners are supported.
    quick?: boolean; // Whether to skip the opening animation.
    absolute?: boolean; // Makes the menus position absolute which will be relative to whichever ancestor has position:relative. Setting x and y will modify the menus left and top. Setting anchor will attempt to position the menu to the anchor.
    fixed?: boolean; // Makes the menus position fixed which will be relative to the window. Setting x and y will modify the menus left and top. Setting anchor will attempt to position the menu to the anchors immediate position before opening.
    x?: number; // null
    y?: number; // null
    forceGroupSelection?: boolean; // Forces a menu group to have a selected item by preventing deselection of menu items in menu groups via user interaction.
    defaultFocus?: DefaultFocusState; // Item to focus upon menu open.
    fullwidth?: boolean; // Sets surface width to 100%.
    wrapFocus?: boolean; // Proxies to
}

/**
 * Material-Component Menu
 * @type {Taco.MetaComponent<MenuProps>}
 */
export const Menu: MetaComponent<MenuProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-menu', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-menu',
        { ...props, is: 'mwc-menu' },
        props.children,
    );
};

/**
 * @typedef RadioProps
 
 */
interface RadioProps {}

/**
 * Material-Component Radio
 * @type {Taco.MetaComponent<RadioProps>}
 */
export const Radio: MetaComponent<RadioProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-radio', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-radio',
        { ...props, is: 'mwc-radio' },
        props.children,
    );
};

/**
 * @typedef SelectProps
 * @property {string} label 			 - Sets floating label value. __NOTE:__ The label will not float if the selected item has a falsey value property.
 * @property {string} naturalMenuWidth 			 - Sets the dropdown menus width to auto.
 * @property {string} icon 			 - Leading icon to display in select. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon). _Note_: for proper list spacing, each list item must have graphic=icon or graphic=avatar to be set.
 * @property {boolean} disabled 			 - Whether or not the select should be disabled.
 * @property {boolean} outlined 			 - Whether or not to show the material outlined variant.
 * @property {string} helper 			 - Helper text to display below the select. Always displays by default.
 * @property {boolean} required 			 - Displays error state if value is empty and select is blurred.
 * @property {string} validationMessage 			 - Message to show in the error color when the select is invalid. (Helper text will not be visible)
 * @property {ListItemBase} selected 			 - null
 * @property {ListItemBase[]} items 			 - List of selectable items.
 * @property {number} index 			 - Index of selected list item.
 * @property {ValidityState} validity 			 - The [ValidityState](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState) of the select.
 * @property {ValidityTransform} validityTransform 			 - null
 */
interface SelectProps {
    label?: string; // Sets floating label value. __NOTE:__ The label will not float if the selected item has a falsey value property.
    naturalMenuWidth?: string; // Sets the dropdown menus width to auto.
    icon?: string; // Leading icon to display in select. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon). _Note_: for proper list spacing, each list item must have graphic=icon or graphic=avatar to be set.
    disabled?: boolean; // Whether or not the select should be disabled.
    outlined?: boolean; // Whether or not to show the material outlined variant.
    helper?: string; // Helper text to display below the select. Always displays by default.
    required?: boolean; // Displays error state if value is empty and select is blurred.
    validationMessage?: string; // Message to show in the error color when the select is invalid. (Helper text will not be visible)
    selected?: ListItemBase; // null
    items?: ListItemBase[]; // List of selectable items.
    index?: number; // Index of selected list item.
    validityTransform?: ValidityTransform; // null
}

/**
 * Material-Component Select
 * @type {Taco.MetaComponent<SelectProps>}
 */
export const Select: MetaComponent<SelectProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-select', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-select',
        { ...props, is: 'mwc-select' },
        props.children,
    );
};

/**
 * @typedef SliderProps
 * @property {number} min 			 - Minimum value of the slider.
 * @property {number} max 			 - Maximum value of the slider.
 * @property {number} step 			 - When defined, the slider will quantize (round to the nearest multiple) all values to match that step value, except for the minimum and maximum values, which can always be set. When 0, quantization is disabled.<br> **NOTE:** Throws when <0.
 * @property {boolean} pin 			 - Shows the thumb pin on a discrete slider.<br> **NOTE:** Numbers displayed inside the slider will be rounded to at most 3 decimal digits.
 * @property {boolean} markers 			 - Shows the tick marks for each step on the track when the slider is discrete.
 */
interface SliderProps {
    min?: number; // Minimum value of the slider.
    max?: number; // Maximum value of the slider.
    step?: number; // When defined, the slider will quantize (round to the nearest multiple) all values to match that step value, except for the minimum and maximum values, which can always be set. When 0, quantization is disabled.<br> **NOTE:** Throws when <0.
    pin?: boolean; // Shows the thumb pin on a discrete slider.<br> **NOTE:** Numbers displayed inside the slider will be rounded to at most 3 decimal digits.
    markers?: boolean; // Shows the tick marks for each step on the track when the slider is discrete.
}

/**
 * Material-Component Slider
 * @type {Taco.MetaComponent<SliderProps>}
 */
export const Slider: MetaComponent<SliderProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-slider', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-slider',
        { ...props, is: 'mwc-slider' },
        props.children,
    );
};

/**
 * @typedef SnackbarProps
 * @property {number} timeoutMs 			 - Automatic dismiss timeout in milliseconds. Value must be between 4000 and 10000  (or -1 to disable the timeout completely) or an error will be thrown. Defaults to 5000 (5 seconds).
 * @property {boolean} closeOnEscape 			 - Whether the snackbar closes when it is focused and the user presses the ESC key. Defaults to false.
 * @property {string} labelText 			 - The text content of the label element.
 * @property {boolean} stacked 			 - Enables the *stacked* layout (see above).
 * @property {boolean} leading 			 - Enables the *leading* layout (see above).
 */
interface SnackbarProps {
    timeoutMs?: number; // Automatic dismiss timeout in milliseconds. Value must be between 4000 and 10000  (or -1 to disable the timeout completely) or an error will be thrown. Defaults to 5000 (5 seconds).
    closeOnEscape?: boolean; // Whether the snackbar closes when it is focused and the user presses the ESC key. Defaults to false.
    labelText?: string; // The text content of the label element.
    stacked?: boolean; // Enables the *stacked* layout (see above).
    leading?: boolean; // Enables the *leading* layout (see above).
}

/**
 * Material-Component Snackbar
 * @type {Taco.MetaComponent<SnackbarProps>}
 */
export const Snackbar: MetaComponent<SnackbarProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-snackbar', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-snackbar',
        { ...props, is: 'mwc-snackbar' },
        props.children,
    );
};

/**
 * @typedef SwitchProps
 * @property {boolean} disabled 			 - Disables the input and sets the disabled styles.
 */
interface SwitchProps {
    disabled?: boolean; // Disables the input and sets the disabled styles.
}

/**
 * Material-Component Switch
 * @type {Taco.MetaComponent<SwitchProps>}
 */
export const Switch: MetaComponent<SwitchProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-switch', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-switch',
        { ...props, is: 'mwc-switch' },
        props.children,
    );
};

/**
 * @typedef TabBarProps
 
 */
interface TabBarProps {}

/**
 * Material-Component TabBar
 * @type {Taco.MetaComponent<TabBarProps>}
 */
export const TabBar: MetaComponent<TabBarProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-tab-bar', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-tab-bar',
        { ...props, is: 'mwc-tab-bar' },
        props.children,
    );
};

/**
 * @typedef TabProps
 * @property {string} icon 			 - Material design icon name to display (overridden by slotted icon).
 * @property {boolean} hasImageIcon 			 - Displays a slot to show an image icon.
 * @property {string} indicatorIcon 			 - Material design icon name to display as the indicator.
 * @property {boolean} isFadingIndicator 			 - Indicator fades in and out instead of sliding.
 * @property {boolean} minWidth 			 - Shrinks tab as narrow as possible without causing text to wrap.
 * @property {boolean} isMinWidthIndicator 			 - Shrinks indicator to be the size of the content.
 * @property {boolean} stacked 			 - Stacks icon on top of label text.
 * @property {boolean} active 			 - Indicates whether the tabs indicator is active.
 */
interface TabProps {
    icon?: string; // Material design icon name to display (overridden by slotted icon).
    hasImageIcon?: boolean; // Displays a slot to show an image icon.
    indicatorIcon?: string; // Material design icon name to display as the indicator.
    isFadingIndicator?: boolean; // Indicator fades in and out instead of sliding.
    minWidth?: boolean; // Shrinks tab as narrow as possible without causing text to wrap.
    isMinWidthIndicator?: boolean; // Shrinks indicator to be the size of the content.
    stacked?: boolean; // Stacks icon on top of label text.
    active?: boolean; // Indicates whether the tabs indicator is active.
}

/**
 * Material-Component Tab
 * @type {Taco.MetaComponent<TabProps>}
 */
export const Tab: MetaComponent<TabProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-tab', true, {
        type: 'module',
    });
    return createVNode('mwc-tab', { ...props, is: 'mwc-tab' }, props.children);
};

/**
 * @typedef TextareaProps
 * @property {number} cols 			 - Sets the visible width of the textarea.
 * @property {string} value 			 - The input controls value.
 * @property {TextFieldType*} type 			 - A string specifying the type of control to render.
 * @property {string} label 			 - Sets floating label value.
 * @property {string} placeholder 			 - Sets disappearing input placeholder.
 * @property {string} icon 			 - Leading icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
 * @property {string} iconTrailing 			 - Trailing icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
 * @property {boolean} disabled 			 - Whether or not the input should be disabled.
 * @property {boolean\} charCounter 			 - TextAreaCharCounter**
 * @property {boolean} outlined 			 - Whether or not to show the material outlined variant.
 * @property {string} helper 			 - Helper text to display below the input. Display default only when focused.
 * @property {boolean} helperPersistent 			 - Always show the helper text despite focus.
 * @property {boolean} required 			 - Displays error state if value is empty and input is blurred.
 * @property {number} maxLength 			 - Maximum length input to accept.
 * @property {string} validationMessage 			 - Message to show in the error color when the textarea is invalid. (Helper text will not be visible)
 */
interface TextareaProps {
    cols?: number; // Sets the visible width of the textarea.
    value?: string; // The input controls value.
    type?: TextFieldType; // A string specifying the type of control to render.
    label?: string; // Sets floating label value.
    placeholder?: string; // Sets disappearing input placeholder.
    icon?: string; // Leading icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
    iconTrailing?: string; // Trailing icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
    disabled?: boolean; // Whether or not the input should be disabled.
    charCounter?: boolean; // TextAreaCharCounter**
    outlined?: boolean; // Whether or not to show the material outlined variant.
    helper?: string; // Helper text to display below the input. Display default only when focused.
    helperPersistent?: boolean; // Always show the helper text despite focus.
    required?: boolean; // Displays error state if value is empty and input is blurred.
    maxLength?: number; // Maximum length input to accept.
    validationMessage?: string; // Message to show in the error color when the textarea is invalid. (Helper text will not be visible)
}

/**
 * Material-Component Textarea
 * @type {Taco.MetaComponent<TextareaProps>}
 */
export const Textarea: MetaComponent<TextareaProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-textarea', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-textarea',
        { ...props, is: 'mwc-textarea' },
        props.children,
    );
};

/**
 * @typedef TextfieldProps
 * @property {TextFieldType*} type 			 - A string specifying the type of control to render.
 * @property {string} label 			 - Sets floating label value.
 * @property {string} placeholder 			 - Sets disappearing input placeholder.
 * @property {string} prefix 			 - Prefix text to display before the input.
 * @property {string} suffix 			 - Suffix text to display after the input.
 * @property {string} icon 			 - Leading icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
 * @property {string} iconTrailing 			 - Trailing icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
 * @property {boolean} disabled 			 - Whether or not the input should be disabled.
 * @property {boolean} charCounter 			 - **Note: requries maxLength to be set.** Display character counter with max length.
 * @property {boolean} outlined 			 - Whether or not to show the material outlined variant.
 * @property {string} helper 			 - Helper text to display below the input. Display default only when focused.
 * @property {boolean} helperPersistent 			 - Always show the helper text despite focus.
 * @property {boolean} required 			 - Displays error state if value is empty and input is blurred.
 * @property {number} maxLength 			 - Maximum length to accept input.
 * @property {string} validationMessage 			 - Message to show in the error color when the textfield is invalid. (Helper text will not be visible)
 * @property {string} pattern 			 -
 */
interface TextfieldProps {
    type?: TextFieldType; // A string specifying the type of control to render.
    label?: string; // Sets floating label value.
    placeholder?: string; // Sets disappearing input placeholder.
    prefix?: string; // Prefix text to display before the input.
    suffix?: string; // Suffix text to display after the input.
    icon?: string; // Leading icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
    iconTrailing?: string; // Trailing icon to display in input. See [mwc-icon](https://github.com/material-components/material-components-web-components/tree/master/packages/icon).
    disabled?: boolean; // Whether or not the input should be disabled.
    charCounter?: boolean; // **Note: requries maxLength to be set.** Display character counter with max length.
    outlined?: boolean; // Whether or not to show the material outlined variant.
    helper?: string; // Helper text to display below the input. Display default only when focused.
    helperPersistent?: boolean; // Always show the helper text despite focus.
    required?: boolean; // Displays error state if value is empty and input is blurred.
    maxLength?: number; // Maximum length to accept input.
    validationMessage?: string; // Message to show in the error color when the textfield is invalid. (Helper text will not be visible)
    pattern?: string; //
}

/**
 * Material-Component Textfield
 * @type {Taco.MetaComponent<TextfieldProps>}
 */
export const Textfield: MetaComponent<TextfieldProps> = props => {
    mustRequire('https://www.unpkg.com/browse/@material/mwc-textfield', true, {
        type: 'module',
    });
    return createVNode(
        'mwc-textfield',
        { ...props, is: 'mwc-textfield' },
        props.children,
    );
};

/**
 * @typedef TopAppBarFixedProps
 * @property {boolean} dense 			 - Makes the bar a little smaller for higher density applications.
 * @property {boolean} prominent 			 - Makes the bar much taller, can be combined with dense.
 * @property {HTMLElement} scrollTarget 			 - window
 */
interface TopAppBarFixedProps {
    dense?: boolean; // Makes the bar a little smaller for higher density applications.
    prominent?: boolean; // Makes the bar much taller, can be combined with dense.
    scrollTarget?: HTMLElement; // window
}

/**
 * Material-Component TopAppBarFixed
 * @type {Taco.MetaComponent<TopAppBarFixedProps>}
 */
export const TopAppBarFixed: MetaComponent<TopAppBarFixedProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-top-app-bar-fixed',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-top-app-bar-fixed',
        { ...props, is: 'mwc-top-app-bar-fixed' },
        props.children,
    );
};

/**
 * @typedef TopAppBarProps
 * @property {boolean} dense 			 - Makes the bar a little smaller for higher density applications.
 * @property {boolean} prominent 			 - Makes the bar much taller, can be combined with dense.
 * @property {HTMLElement} scrollTarget 			 - window
 */
interface TopAppBarProps {
    dense?: boolean; // Makes the bar a little smaller for higher density applications.
    prominent?: boolean; // Makes the bar much taller, can be combined with dense.
    scrollTarget?: HTMLElement; // window
}

/**
 * Material-Component TopAppBar
 * @type {Taco.MetaComponent<TopAppBarProps>}
 */
export const TopAppBar: MetaComponent<TopAppBarProps> = props => {
    mustRequire(
        'https://www.unpkg.com/browse/@material/mwc-top-app-bar',
        true,
        {
            type: 'module',
        },
    );
    return createVNode(
        'mwc-top-app-bar',
        { ...props, is: 'mwc-top-app-bar' },
        props.children,
    );
};
