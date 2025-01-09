import React from "@modules/react";
import Strings from "@modules/strings";
import Settings from "@modules/settingsmanager";
import DiscordModules from "@modules/discordmodules";

import Button from "@ui/base/button";
import Modals from "@ui/modals";

import SettingsGroup from "@ui/settings/group";
import SettingsTitle from "@ui/settings/title";

import Restore from "@ui/icons/restore";

function makeResetButton(collectionId) {
    const action = confirmReset(() => Settings.resetCollection(collectionId));
    return <DiscordModules.Tooltip color="primary" position="top" text={Strings.Settings.resetSettings}>
                {(props) =>
                    <Button {...props} size={Button.Sizes.ICON} look={Button.Looks.BLANK} color={Button.Colors.TRANSPARENT} onClick={action}>
                        <Restore />
                    </Button>
                }
            </DiscordModules.Tooltip>;
}

/**
 * @param {function} action
 * @returns 
 */
function confirmReset(action) {
    return () => {
        Modals.showConfirmationModal(Strings.Modals.confirmAction, Strings.Settings.resetSettingsWarning, {
            confirmText: Strings.Modals.okay,
            cancelText: Strings.Modals.cancel,
            danger: true,
            onConfirm: action,
        });
    };
}

export default function SettingsPanel({id, title, groups, onChange, onDrawerToggle, getDrawerState}) {

    // TODO: add onChange here to lift and manage state here

    return <>
        <SettingsTitle text={title}>
            {makeResetButton(id)}
        </SettingsTitle>,
        {groups.map(section => {
            const props = Object.assign({}, section, {
                onChange,
                onDrawerToggle: state => onDrawerToggle(id, section.id, state),
                shown: getDrawerState(id, section.id, section.hasOwnProperty("shown") ? section.shown : true)
            });
            return <SettingsGroup {...props} />;
        })}
    </>;

}